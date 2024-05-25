const mongoose = require("mongoose");
const { Schema } = mongoose;
const Counter = require("./counter.model");

const ProductSchema = new Schema({
  codproducto: { type: String, unique: true },
  name: String,
  description: String,
  category: String,
  price: Number,
  stock: Number
});

ProductSchema.pre("save", async function(next) {
  let product = this;
  try {
    if (!product.codproducto) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "productId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      product.codproducto = counter.seq.toString().padStart(7, "0");
    }
    next();
  } catch (err) {
    return next(err);
  }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
