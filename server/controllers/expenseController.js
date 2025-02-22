const Expense = require('../models/Expense');

// GET /api/expenses - Retrieve all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/expenses - Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { type, description, amount, expenseDate } = req.body;
    if (!type || !amount) {
      return res.status(400).json({ error: 'Expense type and amount are required.' });
    }
    const newExpense = new Expense({
      type,
      description,
      amount,
      expenseDate: expenseDate ? new Date(expenseDate) : Date.now()
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/expenses/:id - Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
