const db = require("../models");
const Product = db.product;
 
// Crear y guardar un nuevo producto
exports.create = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    stock: req.body.stock
  });

  try {
    const savedProduct = await product.save();
    res.send(savedProduct.name+" Producto añadido correctamente");
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Product."
    });
  }
};
 
// Obtener todos los productos
exports.findAll = (req, res) => {
  Product.find({})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving products."
      });
    });
};


// Encontrar un solo producto con un id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Product.findById(id)
    .then(data => {
      if (!data) res.status(404).send({ message: "Not found Product with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Product with id=" + id });
    });
};

 
// Actualizar un producto por el codproducto en la solicitud
exports.updateByCodProducto = (req, res) => {
  if (!req.params ) {
    return res.status(400).send({
      message: "Data to update can not be empty, and codproducto is required!"
    });
  }

  const codproducto = req.params.codproducto;

  // Asegurarse de que solo se actualicen precio y stock
  const { price, stock } = req.body;

  Product.findOneAndUpdate(
    { codproducto: codproducto },
    { price: price, stock: stock },
    { useFindAndModify: false, new: true } // new: true para devolver el producto actualizado
  )
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Product with codproducto=${codproducto}. Maybe Product was not found!`
        });
      } else {
        res.send({ message: "Product was updated successfully.", data: data });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Product with codproducto=" + codproducto
      });
    });
};
// Eliminar un producto por el codproducto especificado en la solicitud
exports.delete = (req, res) => {
  const codproducto = req.params.codproducto;

  Product.findOneAndRemove({ codproducto: codproducto })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Product with codproducto=${codproducto}. Maybe Product was not found!`
        });
      } else {
        res.send({
          message: "Product was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Product with codproducto=" + codproducto
      });
    });
};

 