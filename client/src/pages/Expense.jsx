import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!type || !amount) {
      alert('Expense type and amount are required.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/expenses', {
        type,
        description,
        amount: Number(amount),
        expenseDate: expenseDate || new Date()
      });
      setType('');
      setDescription('');
      setAmount('');
      setExpenseDate('');
      fetchExpenses();
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Shop Expenses</h2>
      <form onSubmit={handleCreateExpense} className="mb-3">
        <div className="row g-2">
          <div className="col-md-3">
            <label>Expense Type</label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="Worker Salary">Worker Salary</option>
              <option value="Electricity Bill">Electricity Bill</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-3">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label>Amount (PKR)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Add Expense
            </button>
          </div>
        </div>
      </form>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Amount (PKR)</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length ? (
            expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.type}</td>
                <td>{expense.description || '-'}</td>
                <td>{expense.amount}</td>
                <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteExpense(expense._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No expenses recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Expense;
