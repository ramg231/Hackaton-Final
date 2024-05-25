const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PKBJXRqB2xZTk6LwoCeJGRJAiG4LBlut4jFYWRMGOZ1sNmLBA0MBONiGFEStYQCcGGQkNePn7hjVlEn2Q3LvrmW00SGb2KvPj');

const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const { createCustomer } = require('./stripe.service');

exports.processPayment = async (req, res) => {
  const orderNumber = req.params.orderNumber;

  try {
    // Find order in database
    const order = await Order.findOne({ orderNumber }).populate('items.product');

    if (!order) {
      return res.status(404).send({ message: 'Order not found.' });
    }

    // Get user from database
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Create customer in Stripe if not exists
    if (!user.stripeCustomerId) {
      const customer = await createCustomer(user);
      console.log('Customer created in Stripe:', customer);

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Calculate total amount
    const totalAmount = calculateTotalAmount(order.items) * 100; // Convert to cents
    console.log('Total amount:', totalAmount);

    // Create a PaymentIntent manually
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      customer: user.stripeCustomerId,
      metadata: { integration_check: 'accept_a_payment' },
    });

    console.log('PaymentIntent created:', paymentIntent);

    // Create checkout session in Stripe using the created PaymentIntent
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price * 100, // price in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:8080/payment/success',
      cancel_url: 'http://localhost:8080/payment/cancel',
      payment_intent_data: {
        description: 'Payment for order ' + order.orderNumber,
      },
    });

    console.log('Stripe session created:', session);

    // Save payment details in your database
    try {
      const payment = new Payment({
        user: req.userId,
        order: order._id,
        paymentIntentId: paymentIntent.id,
        paymentMethodId: 'card', // Adjust as needed
        amount: totalAmount / 100, // Convert back to dollars
        currency: 'usd',
        status: 'pending',
        session_id: session.id, // Save the session ID for later reference if needed
      });

      console.log('Payment document before saving:', payment);

      await payment.save();
      console.log('Payment saved successfully:', payment);

      // Return only the URL as JSON response
      res.status(200).json({ url: session.url });

    } catch (saveError) {
      console.error('Error saving payment:', saveError);
      res.status(500).send({ message: 'Failed to save payment.', error: saveError.message });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).send({ message: 'Payment failed.', error: error.message });
  }
};

function calculateTotalAmount(items) {
  let total = 0;
  for (const item of items) {
    total += item.quantity * item.product.price;
  }
  return total;
}
