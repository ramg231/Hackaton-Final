// controllers/webhook.controller.js

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PKBJXRqB2xZTk6LwoCeJGRJAiG4LBlut4jFYWRMGOZ1sNmLBA0MBONiGFEStYQCcGGQkNePn7hjVlEn2Q3LvrmW00SGb2KvPj');
const Payment = require('../models/payment.model');
const Order = require('../models/order.model');

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = "whsec_bebb9a1c1fe7aea3ea847de9332804bc6e23383e8f6957655e00a947b38f2597";

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        console.log('Checkout session completed:', session);

        const paymentIntentId = session.payment_intent;

        // Verifica si el paymentIntentId está presente en la sesión
        if (!paymentIntentId) {
          throw new Error('No payment_intent found in session.');
        }

        // Busca el pago en la base de datos usando el paymentIntentId
        const payment = await Payment.findOne({ paymentIntentId });
        if (!payment) {
          throw new Error('Payment not found.');
        }

        // Verifica si el pago ya ha sido completado previamente
        if (payment.status === 'completed') {
          console.log(`Payment with ID ${payment._id} has already been completed.`);
          return res.status(200).json({ received: true });
        }

        // Actualiza el estado del pago
        payment.status = 'completed';
        payment.paymentMethodId = session.payment_method_types[0];
        payment.amount = session.amount_total / 100; // Convertir de centavos a dólares
        payment.currency = session.currency.toUpperCase();
        await payment.save();

        // Actualiza el estado del pedido asociado al pago
        const order = await Order.findById(payment.order);
        if (!order) {
          throw new Error('Order not found.');
        }
        order.status = 'paid';
        await order.save();

        console.log(`Payment with ID ${payment._id} and Order with ID ${order._id} updated successfully.`);

        break;

      case 'charge.updated':
        console.log('Charge updated event received:', event.data.object);
        break;

      case 'payment_intent.created':
        console.log('PaymentIntent created event received:', event.data.object);
        // En este caso, el webhook se disparará cuando se crea el PaymentIntent antes del pago
        break;

      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded event received:', event.data.object);

        const succeededPaymentIntent = event.data.object;

        // Busca el pago en la base de datos usando el paymentIntentId del PaymentIntent que se ha completado
        const succeededPayment = await Payment.findOne({ paymentIntentId: succeededPaymentIntent.id });
        if (!succeededPayment) {
          throw new Error('Payment not found.');
        }

        // Verifica si el pago ya ha sido completado previamente
        if (succeededPayment.status === 'completed') {
          console.log(`Payment with ID ${succeededPayment._id} has already been completed.`);
          return res.status(200).json({ received: true });
        }

        // Actualiza el estado del pago
        succeededPayment.status = 'completed';
        succeededPayment.paymentMethodId = succeededPaymentIntent.payment_method;
        succeededPayment.amount = succeededPaymentIntent.amount / 100; // Convertir de centavos a dólares
        succeededPayment.currency = succeededPaymentIntent.currency.toUpperCase();
        await succeededPayment.save();

        // Actualiza el estado del pedido asociado al pago
        const succeededOrder = await Order.findById(succeededPayment.order);
        if (!succeededOrder) {
          throw new Error('Order not found.');
        }
        succeededOrder.status = 'paid';
        await succeededOrder.save();

        console.log(`Payment with ID ${succeededPayment._id} and Order with ID ${succeededOrder._id} updated successfully.`);

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Enviar una respuesta exitosa
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
