 
const homeproduct = require("../controllers/homeproduct.controller");
module.exports = function(app) {
    // Middleware para configurar CORS
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      next();
    });
            
    // Buscar productos por nombre
    app.post("/api/home/searchByName", homeproduct.findByName);
  
    // Buscar productos por categoría
    app.post("/api/home/searchByCategory", homeproduct.findByCategory);
  };
  