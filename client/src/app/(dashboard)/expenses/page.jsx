'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrashIcon } from '@heroicons/react/24/outline';

const expenseTypes = [
  'Worker Salary',
  'Electricity Bill',
  'Rent',
  'Other'
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    type: '',
    description: '',
    amount: '',
    expenseDate: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.type || !newExpense.amount) {
      alert('Expense type and amount are required.');
      return;
    }
    try {
      await axios.post('/api/expenses', {
        type: newExpense.type,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        expenseDate: newExpense.expenseDate || new Date()
      });
      setNewExpense({
        type: '',
        description: '',
        amount: '',
        expenseDate: ''
      });
      fetchExpenses();
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete('/api/expenses', { data: { id } });
        fetchExpenses();
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shop Expenses</h2>
      </div>

      {/* Add Expense Form */}
      <div className="card">
        <form onSubmit={handleCreateExpense} className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expense Type</label>
            <select
              className="input-field mt-1"
              value={newExpense.type}
              onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
              required
            >
              <option value="">Select Type</option>
              {expenseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              className="input-field mt-1"
              placeholder="Optional description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (PKR)</label>
            <input
              type="number"
              className="input-field mt-1"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className="input-field mt-1"
              value={newExpense.expenseDate}
              onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
            />
          </div>
          
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (PKR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length ? (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{expense.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{expense.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No expenses recorded.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="2" className="px-6 py-4 text-sm font-medium text-gray-900">
                  Total Expenses
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  PKR {calculateTotal().toFixed(2)}
                </td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
} 