const { authJwt } = require("../middlewares");
const cartController = require("../controllers/checkout.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  app.post("/api/checkout/add", [authJwt.verifyToken, authJwt.isUser], cartController.addToCart);
  app.get("/api/checkout", [authJwt.verifyToken, authJwt.isUser], cartController.getCart);
  app.delete("/api/checkout/:cartId/remove/:codproducto", [authJwt.verifyToken, authJwt.isUser], cartController.removeFromCart);

};
