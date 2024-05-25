const { authJwt } = require("../middlewares");
const products = require("../controllers/product.controller");

module.exports = function(app) {
  // Middleware para configurar CORS
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Crear un nuevo producto (solo para admin)
  app.post("/api/products/addproduct", [authJwt.verifyToken, authJwt.isAdmin], products.create);

  // Obtener todos los productos
  app.get("/api/products", products.findAll);

  // Obtener un solo producto con id (solo para admin)
  app.get("/api/products/:id", [authJwt.verifyToken, authJwt.isAdmin], products.findOne);

  // Actualizar un producto con codproducto (solo para admin)
  app.put("/api/products/:codproducto", [authJwt.verifyToken, authJwt.isAdmin],products.updateByCodProducto );

  // Eliminar un producto con id (solo para admin)
  app.delete("/api/products/delete/:codproducto", [authJwt.verifyToken, authJwt.isAdmin], products.delete);

 
};
