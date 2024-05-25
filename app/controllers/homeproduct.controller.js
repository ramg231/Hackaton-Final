const db = require("../models");
const Product = db.product;



// Buscar productos por nombre
exports.findByName = (req, res) => {
  const name = req.body.name;

  // Verificar si se proporcionó el parámetro 'name'
  if (!name) {
    return res.status(400).send({ message: "Name parameter is required!" });
  }

  // Construir la condición de búsqueda usando regex
  const regex = new RegExp(name, "i"); // 'i' para hacer la búsqueda case-insensitive

  Product.find({ name: { $regex: regex } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving products by name."
      });
    });
};

  
  // Buscar productos por categoría
  exports.findByCategory = (req, res) => {
    const category =  req.body.category;
    if (!category) {
      return res.status(400).send({ message: "Category parameter is required!" });
    }
  
    Product.find({ category: { $regex: new RegExp(category), $options: "i" } })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving products by category."
        });
      });
  };