const mongoose = require('mongoose');

// Each item in a sale
const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  salePrice: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  }
});

// The sale itself
const saleSchema = new mongoose.Schema({
  buyerName: {
    type: String,
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  items: [saleItemSchema],     // array of items
  totalAmount: {
    type: Number,
    required: true
  },
  totalProfit: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Sale', saleSchema);
