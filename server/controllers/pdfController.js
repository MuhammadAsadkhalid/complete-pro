// server/controllers/pdfController.js
const PdfPrinter = require('pdfmake');
const fonts = require('../config/pdfFonts'); // your TTF config
const Product = require('../models/Product'); // just an example if you need DB data

exports.generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    // Suppose we want to load some data from DB.
    // For example, a product or anything else:
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Data not found' });
    }

    // Create pdfmake printer
    const printer = new PdfPrinter(fonts);

    // Build advanced docDefinition
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: 'Rail bazar Ghullam Muhammad abad Faisalabad',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Phone: 0349-6574832',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // Example advanced layout: multi-column
        {
          columns: [
            {
              width: '50%',
              text: `Product: ${product.name}\nStock: ${product.stock}\nPrice: PKR ${product.price}`,
              style: 'content',
              margin: [0, 0, 0, 10]
            },
            {
              width: '50%',
              text: `Date: ${new Date().toLocaleString()}`,
              alignment: 'right',
              style: 'content'
            }
          ]
        },

        // A table example
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Detail', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
              ['Category', product.category || '-'],
              ['Stock', String(product.stock)],
              ['Price', `PKR ${product.price}`],
            ]
          },
          margin: [0, 20, 0, 20]
        },

        // A final line
        {
          text: '--------------------------------------',
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        
        {
          text: `My Name: Name A\nPhone: 2883733738`,
          style: 'footer',
          alignment: 'center'
        }
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        content: { fontSize: 12 },
        tableExample: { margin: [0, 5, 0, 15] },
        tableHeader: { bold: true, fillColor: '#eeeeee' },
        footer: { fontSize: 10, margin: [0, 20, 0, 0] }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Setup response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${id}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
