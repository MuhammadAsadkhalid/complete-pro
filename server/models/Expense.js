const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true 
  }, // e.g., "Worker Salary", "Electricity Bill", "Rent", "Other"
  description: { type: String },
  amount: { 
    type: Number, 
    required: true 
  },
  expenseDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
