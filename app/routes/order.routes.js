 const { authJwt } = require("../middlewares");
const orderController = require('../controllers/order.controller');
 module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Ruta en Express
app.post('/api/checkout/confirm-purchase/:cartId', [authJwt.verifyToken, authJwt.isUser], orderController.confirmPurchase);

 

};
