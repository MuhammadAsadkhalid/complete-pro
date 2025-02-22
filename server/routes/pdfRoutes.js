// server/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const { generateReceipt } = require('../controllers/pdfController');

// GET /api/pdf/receipt/:id
router.get('/receipt/:id', generateReceipt);

module.exports = router;
