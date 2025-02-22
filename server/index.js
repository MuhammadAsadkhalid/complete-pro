// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the connection function

dotenv.config(); // Load environment variables from .env

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/pdf', pdfRoutes);

// Use PORT from .env if available, or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
