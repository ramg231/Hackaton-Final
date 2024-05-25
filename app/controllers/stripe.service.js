const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PKBJXRqB2xZTk6LwoCeJGRJAiG4LBlut4jFYWRMGOZ1sNmLBA0MBONiGFEStYQCcGGQkNePn7hjVlEn2Q3LvrmW00SGb2KvPj');
const User = require('../models/user.model'); // Importa tu modelo de usuario
const createProductStripe = async (data) => {
  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: data.price * 100,
    product_data: {
      name: data.name,
      // description: data.description,
    },
  });

  return price;
};

const createCustomer = async (userData) => {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.username, // Usar el username en lugar de firstName y lastName
      });
  
      // Guardar el stripeCustomerId en la base de datos utilizando el modelo de Mongoose
      const user = await User.findOneAndUpdate(
        { email: userData.email },
        { stripeCustomerId: customer.id },
        { new: true }
      );
  
      if (!user) {
        throw new Error('User not found.');
      }
  
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer in Stripe.');
    }
  };
  
  
  

const createSessionPayment = async (priceId, customerId) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "https://example.com/success",
    cancel_url: "http://localhost:4002/cancel",
  });

  return session;
};

module.exports = {
  createProductStripe,
  createCustomer,
  createSessionPayment,
};
