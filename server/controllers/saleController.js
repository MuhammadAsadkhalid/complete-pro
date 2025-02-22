// server/controllers/saleController.js

const Sale = require('../models/Sale');
const Product = require('../models/Product');
const PdfPrinter = require('pdfmake');
const fonts = require('../config/pdfFonts'); // ensure valid TTF references

// GET /api/sales
// Retrieves all sales, populating each item's product for multi-product data
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('items.product');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/sales
// Creates a multi-product sale
exports.createSale = async (req, res) => {
  try {
    const { buyerName, items } = req.body;

    if (!buyerName) {
      return res.status(400).json({ error: 'Buyer name is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one sale item is required.' });
    }

    let totalAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    // Process each item, subtract stock, compute amounts
    for (const item of items) {
      const { productId, quantity, salePrice } = item;
      if (!productId || !quantity || !salePrice) {
        return res
          .status(400)
          .json({ error: 'Each item must include productId, quantity, and salePrice.' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found (ID: ${productId})` });
      }
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ error: `Not enough stock for product: ${product.name}` });
      }

      // Subtract stock
      await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

      // Calculate item-level totals
      const amount = salePrice * quantity;
      const profit = (salePrice - product.price) * quantity;

      totalAmount += amount;
      totalProfit += profit;

      processedItems.push({
        product: productId,
        quantity,
        salePrice,
        amount,
        profit
      });
    }

    // Create and save the sale record
    const newSale = new Sale({
      buyerName,
      items: processedItems,
      totalAmount,
      totalProfit,
      saleDate: new Date()
    });

    const savedSale = await newSale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/sales/:id
// Updates a multi-product sale (reverts old stock, applies new items)
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerName, items } = req.body;

    if (!buyerName) {
      return res.status(400).json({ error: 'Buyer name is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one sale item is required.' });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found.' });
    }

    // Revert stock for old items
    for (const oldItem of sale.items) {
      await Product.findByIdAndUpdate(oldItem.product, { $inc: { stock: oldItem.quantity } });
    }

    // We'll build new items
    let totalAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    // Process each new item
    for (const item of items) {
      const { productId, quantity, salePrice } = item;
      if (!productId || !quantity || !salePrice) {
        return res.status(400).json({
          error: 'Each item must include productId, quantity, and salePrice.'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found (ID: ${productId})` });
      }
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ error: `Not enough stock for product: ${product.name}` });
      }

      // Subtract new quantity
      await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

      const amount = salePrice * quantity;
      const profit = (salePrice - product.price) * quantity;
      totalAmount += amount;
      totalProfit += profit;

      processedItems.push({
        product: productId,
        quantity,
        salePrice,
        amount,
        profit
      });
    }

    // Update the sale doc
    sale.buyerName = buyerName;
    sale.items = processedItems;
    sale.totalAmount = totalAmount;
    sale.totalProfit = totalProfit;
    sale.saleDate = new Date();

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/sales/:id
// Deletes a sale and reverts stock
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Revert stock for each item
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    await Sale.findByIdAndDelete(id);
    res.json({ message: 'Sale deleted and stock reverted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/sales/:id/receipt
// Generates a PDF receipt for a multi-product sale
exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    // Populate items.product for multi-product details
    const sale = await Sale.findById(id).populate('items.product');
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // pdfmake
    const printer = new PdfPrinter(fonts);

    // Basic info
    const shopName = 'Zafar Electronics';
    const shopAddress = 'Rail bazar Ghullam Muhammad abad Faisalabad';
    const shopPhone = '0349-6574832';
    const receiptFooter = 'Name A | 2883733738';
    const saleDate = sale.saleDate
      ? new Date(sale.saleDate).toLocaleString()
      : new Date().toLocaleString();

    // Build the table body for items
    const tableBody = [
      [
        { text: 'Item', bold: true },
        { text: 'Qty', bold: true, alignment: 'center' },
        { text: 'Price', bold: true, alignment: 'right' },
        { text: 'Total', bold: true, alignment: 'right' }
      ]
    ];
    sale.items.forEach((item) => {
      const productName = item.product ? item.product.name : 'N/A';
      const lineTotal = item.amount || (item.salePrice * item.quantity);
      tableBody.push([
        productName,
        { text: String(item.quantity), alignment: 'center' },
        { text: `PKR ${item.salePrice}`, alignment: 'right' },
        { text: `PKR ${lineTotal}`, alignment: 'right' }
      ]);
    });

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: shopName, style: 'header', alignment: 'center' },
        { text: shopAddress, alignment: 'center', fontSize: 10 },
        {
          text: `Phone: ${shopPhone}`,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            { text: `Receipt #: ${sale._id}`, fontSize: 10 },
            { text: `Date: ${saleDate}`, fontSize: 10, alignment: 'right' }
          ],
          margin: [0, 0, 0, 10]
        },
        { text: `Buyer: ${sale.buyerName}`, fontSize: 10, margin: [0, 0, 0, 10] },

        // Items table
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: tableBody
          },
          layout: 'lightHorizontalLines',
          margin: [0, 10, 0, 15]
        },

        // Grand total
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                body: [
                  [
                    { text: 'Grand Total', bold: true },
                    { text: `PKR ${sale.totalAmount}`, bold: true, alignment: 'right' }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ]
        },

        // Footer
        {
          text: receiptFooter,
          fontSize: 10,
          alignment: 'center',
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=receipt-${sale._id}.pdf`
    );
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: 'Failed to generate receipt PDF' });
  }
};
