// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// GET /api/products
router.get('/', getAllProducts);
// POST /api/products
router.post('/', createProduct);
// PUT /api/products/:id
router.put('/:id', updateProduct);
// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
