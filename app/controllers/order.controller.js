// controllers/order.controller.js

const db = require('../models');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

exports.confirmPurchase = (req, res) => {
  const userId = req.userId;
  const cartId = req.params.cartId;

  // Encontrar el carrito del usuario
  Cart.findOne({ user: userId, _id: cartId })
    .populate('items.product')
    .then(cart => {
      if (!cart) {
        return res.status(404).send({ message: 'Cart not found!' });
      }

      // Crear una nueva orden basada en los productos del carrito
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      }));

      // Generar un número de orden único
      const orderNumber = generateOrderNumber();

      const newOrder = new Order({
        orderNumber: orderNumber,
        user: userId,
        items: orderItems
      });

      // Guardar la nueva orden
      return newOrder.save()
        .then(() => {
          // Limpiar el carrito después de confirmar la compra
          return Cart.findOneAndUpdate(
            { user: userId, _id: cartId },
            { $set: { items: [] } },
            { new: true }
          );
        });
    })
    .then(() => res.send({ message: 'Purchase confirmed successfully.' }))
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

function generateOrderNumber() {
  // Lógica para generar un número de orden único
  return 'ORD-' + Math.random().toString(36).substr(2, 9);
}