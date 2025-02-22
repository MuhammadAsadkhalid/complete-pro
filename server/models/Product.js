// server/models/Product.js
const mongoose = require('mongoose');

// server/models/Product.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 } // e.g., cost price
});

module.exports = mongoose.model('Product', productSchema);
