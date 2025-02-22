'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, MinusIcon, PencilIcon, TrashIcon, DocumentIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Add this at the beginning of your component
const getCurrentMonthDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };
};

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [saleItems, setSaleItems] = useState([
    { productId: '', quantity: 1, salePrice: '' }
  ]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaleId, setEditSaleId] = useState('');
  const [editSaleData, setEditSaleData] = useState({ buyerName: '', items: [] });

  // Initialize dateRange with current month
  const [dateRange, setDateRange] = useState(getCurrentMonthDates());
  const [filteredSales, setFilteredSales] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalItems: 0,
    totalExpenses: 0
  });

  // Add new state for bulk delete
  const [selectedSales, setSelectedSales] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  useEffect(() => {
    const total = saleItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.salePrice) || 0;
      return sum + (qty * price);
    }, 0);
    setOverallTotal(total);
  }, [saleItems]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get('/api/sales');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    for (let item of saleItems) {
      if (!item.productId || !item.salePrice) {
        alert('Please fill out all fields for each sale item.');
        return;
      }
    }
    try {
      const total = saleItems.reduce((sum, item) => 
        sum + (Number(item.quantity) * Number(item.salePrice)), 0);

      await axios.post('/api/sales', {
        buyerName,
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          salePrice: Number(item.salePrice)
        })),
        total
      });
      setBuyerName('');
      setSaleItems([{ productId: '', quantity: 1, salePrice: '' }]);
      setOverallTotal(0);
      fetchSales();
      fetchProducts();
    } catch (err) {
      console.error('Error creating sale:', err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...saleItems];
    updated[index][field] = value;
    setSaleItems(updated);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: '', quantity: 1, salePrice: '' }]);
  };

  const removeSaleItem = (index) => {
    if (saleItems.length > 1) {
      const updated = saleItems.filter((_, i) => i !== index);
      setSaleItems(updated);
    }
  };

  const openEditModal = (sale) => {
    setEditSaleId(sale._id);
    const itemsForEdit = sale.items.map(item => ({
      productId: item.product ? item.product._id : '',
      quantity: item.quantity,
      salePrice: item.salePrice
    }));
    setEditSaleData({
      buyerName: sale.buyerName,
      items: itemsForEdit
    });
    setEditModalOpen(true);
  };

  const handleEditItemChange = (index, field, value) => {
    const updated = [...editSaleData.items];
    updated[index][field] = value;
    setEditSaleData({ ...editSaleData, items: updated });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editSaleData.buyerName) {
      alert('Buyer name is required.');
      return;
    }
    for (let item of editSaleData.items) {
      if (!item.productId || !item.salePrice) {
        alert('Please fill out all fields for each sale item.');
        return;
      }
    }
    try {
      await axios.put('/api/sales', {
        id: editSaleId,
        buyerName: editSaleData.buyerName,
        items: editSaleData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          salePrice: Number(item.salePrice)
        }))
      });
      setEditModalOpen(false);
      fetchSales();
      fetchProducts();
    } catch (err) {
      console.error('Error updating sale:', err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      }
    }
  };

  const handleDeleteSale = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete('/api/sales', { data: { id } });
        fetchSales();
        fetchProducts();
      } catch (err) {
        console.error('Error deleting sale:', err);
      }
    }
  };

  // Add this helper function at the top of your component
  const generateSaleId = (mongoId, date) => {
    const timestamp = new Date(date).getTime();
    const shortId = mongoId.slice(-4);
    return `INV-${timestamp.toString().slice(-6)}${shortId}`;
  };

  // Update handleReceipt function
  const handleReceipt = async (saleId) => {
    try {
      const sale = sales.find(s => s._id === saleId);
      if (!sale) {
        console.error('Sale not found');
        return;
      }

      const receiptWindow = window.open('', '_blank');
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Al-Zafar Electronics - Receipt</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                line-height: 1.5;
              }
              .shop-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
              }
              .contact-info {
                margin: 5px 0;
              }
              .buyer-info {
                text-align: left;
                margin: 20px 0;
              }
              .sale-id {
                text-align: left;
                margin-bottom: 20px;
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              th, td { 
                padding: 8px; 
                text-align: left; 
                border-bottom: 1px solid #ddd; 
              }
              .total-section {
                text-align: left;
                margin-top: 20px;
                font-weight: bold;
              }
              @media print {
                .no-print { display: none; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="shop-name">Al-Zafar Electronics</div>
              <div class="contact-info">Date: ${new Date(sale.date).toLocaleString()}</div>
              <div class="contact-info">For Contact: 03357214221</div>
              <div class="contact-info">03007214221</div>
              <div class="contact-info">03262627333</div>
            </div>

            <div class="buyer-info">
              Buyer: ${sale.buyerName}
            </div>

            <div class="sale-id">
              Sale ID: ${sale._id}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map(item => `
                  <tr>
                    <td>${item.product?.name || 'Product'}</td>
                    <td>${item.quantity}</td>
                    <td>PKR ${formatNumber(item.salePrice)}</td>
                    <td>PKR ${formatNumber(item.quantity * item.salePrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              Total Amount: PKR ${formatNumber(sale.total)}
            </div>

            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" style="
                padding: 10px 20px;
                background-color: #2563eb;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
              ">Print Receipt</button>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Error generating receipt. Please try again.');
    }
  };

  // Add bulk delete function
  const handleBulkDelete = async () => {
    if (!selectedSales.length) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedSales.length} sales?`)) {
      try {
        await Promise.all(selectedSales.map(id => 
          axios.delete('/api/sales', { data: { id } })
        ));
        setSelectedSales([]);
        fetchSales();
        fetchProducts();
      } catch (err) {
        console.error('Error deleting sales:', err);
      }
    }
  };

  // Update filterSales function
  const filterSales = async () => {
    try {
      if (!dateRange.startDate || !dateRange.endDate) {
        const currentMonthDates = getCurrentMonthDates();
        setDateRange(currentMonthDates);
        return;
      }

      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);

      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });

      setFilteredSales(filtered);
      await calculateStats(filtered);
      setSelectedSales([]); // Clear selection when filter changes
    } catch (err) {
      console.error('Error filtering sales:', err);
    }
  };

  // Update calculateStats function
  const calculateStats = async (salesData) => {
    if (!Array.isArray(salesData)) return;

    try {
      let stats = {
        totalSales: 0,
        totalProfit: 0,
        totalItems: 0,
        totalExpenses: 0
      };

      // Calculate sales stats
      salesData.forEach(sale => {
        if (!sale) return;

        // Calculate total sales
        const saleTotal = Number(sale.total) || 0;
        stats.totalSales += saleTotal;

        // Calculate total items
        const itemCount = sale.items?.reduce((sum, item) => 
          sum + (Number(item.quantity) || 0), 0) || 0;
        stats.totalItems += itemCount;

        // Calculate profit using stored costPrice
        const profit = sale.items?.reduce((sum, item) => {
          const costPrice = item.costPrice || 0;
          const salePrice = Number(item.salePrice) || 0;
          const quantity = Number(item.quantity) || 0;
          return sum + ((salePrice - costPrice) * quantity);
        }, 0) || 0;
        stats.totalProfit += profit;
      });

      // Calculate expenses for the filtered period
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);

        const expensesResponse = await axios.get('/api/expenses');
        const expenses = expensesResponse.data;

        if (Array.isArray(expenses)) {
          const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.expenseDate);
            return expenseDate >= start && expenseDate <= end;
          });

          stats.totalExpenses = filteredExpenses.reduce((sum, expense) => 
            sum + (Number(expense.amount) || 0), 0);
          
          // Deduct expenses from profit
          stats.totalProfit -= stats.totalExpenses;
        }
      }

      setSalesStats(stats);
      setShowStats(true);
    } catch (err) {
      console.error('Error calculating stats:', err);
      setSalesStats({
        totalSales: 0,
        totalProfit: 0,
        totalItems: 0,
        totalExpenses: 0
      });
    }
  };

  // Update filtered sales when date range or sales change
  useEffect(() => {
    filterSales();
  }, [dateRange, sales]);

  // Add this helper function at the top of your component
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0.00";
    return Number(value).toFixed(2);
  };

  // Update useEffect to initialize filteredSales with current month data
  useEffect(() => {
    if (sales.length > 0) {
      filterSales(); // This will now use the current month dates by default
    }
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              className="input-field mt-1"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              className="input-field mt-1"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={filterSales}
              className="btn-secondary w-full flex items-center justify-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filter Sales
            </button>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setDateRange(getCurrentMonthDates());
                setTimeout(filterSales, 0);
              }}
              className="btn-secondary w-full flex items-center justify-center"
            >
              Reset to Current Month
            </button>
          </div>
        </div>

        {/* Sales Statistics */}
        {showStats && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Total Sales</h3>
              <p className="mt-2 text-2xl font-semibold text-blue-900">
                PKR {formatNumber(salesStats.totalSales)}
              </p>
              <p className="mt-1 text-sm text-blue-600">
                {dateRange.startDate === getCurrentMonthDates().startDate ? 
                  'Current Month' :
                  `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
                }
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Net Profit</h3>
              <p className="mt-2 text-2xl font-semibold text-green-900">
                PKR {formatNumber(salesStats.totalProfit)}
              </p>
              <p className="mt-1 text-sm text-green-600">After Expenses</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Items Sold</h3>
              <p className="mt-2 text-2xl font-semibold text-purple-900">
                {salesStats.totalItems}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
              <p className="mt-2 text-2xl font-semibold text-red-900">
                PKR {formatNumber(salesStats.totalExpenses)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Sale Form */}
      <div className="card">
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
            <input
              type="text"
              className="input-field mt-1"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />
          </div>

          {saleItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  className="input-field mt-1"
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  step="0.01"
                  value={item.salePrice}
                  onChange={(e) => handleItemChange(index, 'salePrice', e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => removeSaleItem(index)}
                  className="btn-secondary p-2"
                  disabled={saleItems.length === 1}
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                {index === saleItems.length - 1 && (
                  <button
                    type="button"
                    onClick={addSaleItem}
                    className="btn-secondary p-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total: PKR {overallTotal.toFixed(2)}
            </div>
            <button type="submit" className="btn-primary">
              Create Sale
            </button>
          </div>
        </form>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedSales.length === filteredSales.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSales(filteredSales.map(sale => sale._id));
                      } else {
                        setSelectedSales([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const profit = sale.items?.reduce((sum, item) => {
                    try {
                      if (!item || !item.quantity) return sum;
                      
                      const costPrice = item.costPrice || 0;
                      const salePrice = Number(item.salePrice) || 0;
                      const quantity = Number(item.quantity) || 0;
                      return sum + ((salePrice - costPrice) * quantity);
                    } catch (err) {
                      console.error('Error calculating item profit:', item, err);
                      return sum;
                    }
                  }, 0) || 0;

                  return (
                    <tr key={sale._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSales.includes(sale._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSales([...selectedSales, sale._id]);
                            } else {
                              setSelectedSales(selectedSales.filter(id => id !== sale._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(sale.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.buyerName}</td>
                      <td className="px-6 py-4">
                        {sale.items?.map((item, i) => (
                          <div key={i} className="text-sm">
                            {item.product?.name} x {item.quantity || 0} @ PKR {formatNumber(item.salePrice)}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        PKR {formatNumber(sale.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">
                        PKR {formatNumber(profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditModal(sale)}
                          className="btn-secondary inline-flex items-center p-1"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale._id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReceipt(sale._id)}
                          className="text-gray-600 hover:text-gray-800 inline-flex items-center p-1"
                        >
                          <DocumentIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No sales found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Sale</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={editSaleData.buyerName}
                  onChange={(e) => setEditSaleData({ ...editSaleData, buyerName: e.target.value })}
                  required
                />
              </div>

              {editSaleData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <select
                      className="input-field mt-1"
                      value={item.productId}
                      onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      className="input-field mt-1"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                    <input
                      type="number"
                      className="input-field mt-1"
                      step="0.01"
                      value={item.salePrice}
                      onChange={(e) => handleEditItemChange(index, 'salePrice', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 