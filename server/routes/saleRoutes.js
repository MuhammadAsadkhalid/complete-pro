const express = require('express');
const router = express.Router();
const {
  getSales,
  createSale,
  deleteSale,
  updateSale,
  downloadReceipt
} = require('../controllers/saleController');

// GET all sales
router.get('/', getSales);

// POST create a sale (multi-product)
router.post('/', createSale);

// DELETE sale
router.delete('/:id', deleteSale);

// PUT edit sale (optional)
router.put('/:id', updateSale);

// GET PDF receipt
router.get('/:id/receipt', downloadReceipt);

module.exports = router;
