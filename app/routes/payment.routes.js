const { authJwt } = require("../middlewares");
const paymentController = require('../controllers/payment.controller');
 module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Ruta en Express
app.post('/api/payment/process/:orderNumber', [authJwt.verifyToken, authJwt.isUser], paymentController.processPayment);
};
