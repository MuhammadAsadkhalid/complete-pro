// client/src/pages/Sales.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  // Create sale form state
  const [buyerName, setBuyerName] = useState('');
  const [saleItems, setSaleItems] = useState([
    { productId: '', quantity: 1, salePrice: '' }
  ]);
  const [overallTotal, setOverallTotal] = useState(0);

  // Edit sale state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaleId, setEditSaleId] = useState('');
  const [editSaleData, setEditSaleData] = useState({ buyerName: '', items: [] });

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  // Recalculate overall total for create form
  useEffect(() => {
    const total = saleItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.salePrice) || 0;
      return sum + (qty * price);
    }, 0);
    setOverallTotal(total);
  }, [saleItems]);

  // Recalculate overall total for edit form (if desired)
  // (This example uses the same inline calculation in the modal rows.)

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sales');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  // --- Create Sale Functions ---
  const handleCreateSale = async (e) => {
    e.preventDefault();
    // Validate that each sale item has productId and salePrice
    for (let item of saleItems) {
      if (!item.productId || !item.salePrice) {
        alert('Please fill out all fields for each sale item.');
        return;
      }
    }
    try {
      await axios.post('http://localhost:5000/api/sales', {
        buyerName,
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          salePrice: Number(item.salePrice)
        }))
      });
      // Clear form
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

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: '', quantity: 1, salePrice: '' }]);
  };

  const removeSaleItem = (index) => {
    const updated = saleItems.filter((_, i) => i !== index);
    setSaleItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...saleItems];
    updated[index][field] = value;
    setSaleItems(updated);
  };

  // --- Edit Sale Functions ---
  const openEditModal = (sale) => {
    // Prepare editSaleData from the selected sale
    setEditSaleId(sale._id);
    // Assume sale.buyerName and sale.items exist; sale.items should be an array with { product, quantity, salePrice, amount, profit }
    // We'll map product to productId for the form.
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

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEditItemChange = (index, field, value) => {
    const updated = [...editSaleData.items];
    updated[index][field] = value;
    setEditSaleData({ ...editSaleData, items: updated });
  };

  const addEditSaleItem = () => {
    setEditSaleData({
      ...editSaleData,
      items: [...editSaleData.items, { productId: '', quantity: 1, salePrice: '' }]
    });
  };

  const removeEditSaleItem = (index) => {
    const updated = editSaleData.items.filter((_, i) => i !== index);
    setEditSaleData({ ...editSaleData, items: updated });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    // Validate editSaleData
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
      await axios.put(`http://localhost:5000/api/sales/${editSaleId}`, {
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

  // Delete sale function (unchanged)
  const handleDeleteSale = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sales/${id}`);
      fetchSales();
      fetchProducts();
    } catch (err) {
      console.error('Error deleting sale:', err);
    }
  };

  // Receipt: open new tab with PDF receipt
  const handleReceipt = (saleId) => {
    window.open(`http://localhost:5000/api/sales/${saleId}/receipt`, '_blank');
  };

  return (
    <div>
      <h2>Sales (Multi-Product)</h2>
      {/* Create Sale Form */}
      <form onSubmit={handleCreateSale} className="mb-3">
        <div className="mb-2">
          <label>Buyer Name:</label>
          <input
            type="text"
            className="form-control"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
          />
        </div>
        {saleItems.map((item, index) => (
          <div key={index} className="row g-2 align-items-end mb-2">
            <div className="col-md-4">
              <label>Product:</label>
              <select
                className="form-control"
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
            <div className="col-md-2">
              <label>Quantity:</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <label>Sale Price:</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                value={item.salePrice}
                onChange={(e) => handleItemChange(index, 'salePrice', e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <label>Total:</label>
              <input
                type="number"
                className="form-control"
                value={(parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0)}
                readOnly
              />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-danger" onClick={() => removeSaleItem(index)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-2" onClick={addSaleItem}>
          Add Product
        </button>
        <div className="mb-2">
          <strong>Overall Total: PKR {overallTotal}</strong>
        </div>
        <button type="submit" className="btn btn-primary">
          Record Sale
        </button>
      </form>

      {/* Sales Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Sale Date</th>
            <th style={{ width: '300px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id}>
              <td>{s.buyerName}</td>
              <td>
                {s.items?.map((item, i) => (
                  <div key={i}>
                    {item.product?.name || 'N/A'} - Qty: {item.quantity} - Sale Price: PKR {item.salePrice}
                  </div>
                ))}
              </td>
              <td>{s.totalAmount}</td>
              <td>{new Date(s.saleDate).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEditModal(s)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleDeleteSale(s._id)}
                >
                  Delete
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleReceipt(s._id)}
                >
                  Receipt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Sale Modal */}
      {editModalOpen && (
        <div
          className="modal"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Sale</h5>
                  <button type="button" className="btn-close" onClick={closeEditModal} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label>Buyer Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editSaleData.buyerName}
                      onChange={(e) =>
                        setEditSaleData({ ...editSaleData, buyerName: e.target.value })
                      }
                      required
                    />
                  </div>
                  {editSaleData.items.map((item, index) => (
                    <div key={index} className="row g-2 align-items-end mb-2">
                      <div className="col-md-4">
                        <label>Product:</label>
                        <select
                          className="form-control"
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
                      <div className="col-md-2">
                        <label>Quantity:</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label>Sale Price:</label>
                        <input
                          type="number"
                          className="form-control"
                          step="0.01"
                          value={item.salePrice}
                          onChange={(e) => handleEditItemChange(index, 'salePrice', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label>Total:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={(parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0)}
                          readOnly
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeEditSaleItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary mb-2"
                    onClick={addEditSaleItem}
                  >
                    Add Product
                  </button>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
