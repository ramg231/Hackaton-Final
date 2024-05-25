const db = require("../models");
const Cart = db.cart;
const Product = db.product;

exports.addToCart = (req, res) => {
    const userId = req.userId;
    const products = Array.isArray(req.body) ? req.body : [req.body];
  
    // Validar que cada producto tenga una cantidad válida
    for (const item of products) {
      if (!item.quantity || typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).send({ message: "Each product must have a valid quantity greater than zero." });
      }
    }
  
    // Convertir los códigos de productos en una lista de promesas de búsqueda de productos
    const productPromises = products.map(item =>
      Product.findOne({ codproducto: item.codproducto })
    );
  
    // Ejecutar todas las búsquedas de productos
    Promise.all(productPromises)
      .then(foundProducts => {
        const notFound = foundProducts.some(product => !product);
        if (notFound) {
          return res.status(404).send({ message: "One or more products not found!" });
        }
  
        // Encontrar o crear el carrito del usuario
        return Cart.findOneAndUpdate(
          { user: userId },
          { $setOnInsert: { user: userId, items: [] } },
          { upsert: true, new: true }
        ).then(cart => ({ cart, foundProducts }));
      })
      .then(({ cart, foundProducts }) => {
        // Actualizar el carrito del usuario
        products.forEach((item, index) => {
          const product = foundProducts[index];
          const cartItem = cart.items.find(ci => ci.product.toString() === product._id.toString());
          if (cartItem) {
            cartItem.quantity += item.quantity;
          } else {
            cart.items.push({ 
              product: product._id, 
              codproducto: item.codproducto,
              quantity: item.quantity, 
              price: item.price 
            });
          }
        });
        return cart.save();
      })
      .then(() => res.send({ message: "Products added to cart successfully." }))
      .catch(err => {
        if (!res.headersSent) {
          res.status(500).send({ message: err.message });
        }
      });
  };
exports.getCart = (req, res) => {
  Cart.findOne({ user: req.userId })
    .populate('items.product')
    .then(cart => {
      if (!cart) {
        return res.status(404).send({ message: "Cart not found!" });
      }
      res.send(cart.items);
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.removeFromCart = (req, res) => {
    const userId = req.userId;
    const cartId = req.params.cartId;
    const codproducto = req.params.codproducto;

    Cart.findOne({ user: userId, _id: cartId })
        .then(cart => {
            if (!cart) {
                return res.status(404).send({ message: "Cart not found!" });
            }

            // Encuentra el índice del producto en el carrito
            const index = cart.items.findIndex(item => item.codproducto === codproducto);

            if (index === -1) {
                return res.status(404).send({ message: "Product not found in cart!" });
            }

            // Si la cantidad en el carrito es mayor que 1, se reduce la cantidad en 1
            if (cart.items[index].quantity > 1) {
                cart.items[index].quantity -= 1;
            } else {
                // Si la cantidad en el carrito es 1, se elimina el elemento del array
                cart.items.splice(index, 1);
            }

            // Guarda el carrito actualizado
            return cart.save();
        })
        .then(updatedCart => res.send({ message: "Product removed from cart successfully.", cart: updatedCart }))
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};