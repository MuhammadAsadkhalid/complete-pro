import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // For edit
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newStock || !newPrice) return;
    try {
      await axios.post('http://localhost:5000/api/products', {
        name: newName,
        category: newCategory,
        stock: Number(newStock),
        price: Number(newPrice),
      });
      setNewName('');
      setNewCategory('');
      setNewStock('');
      setNewPrice('');
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (p) => {
    setEditId(p._id);
    setEditName(p.name);
    setEditCategory(p.category || '');
    setEditStock(p.stock);
    setEditPrice(p.price);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await axios.put(`http://localhost:5000/api/products/${editId}`, {
        name: editName,
        category: editCategory,
        stock: Number(editStock),
        price: Number(editPrice),
      });
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  // highlight if stock < 7
  const getRowStyle = (stock) => {
    return stock < 7 ? { backgroundColor: '#f8d7da' } : {};
  };

  return (
    <div>
      <h2>Products</h2>

      {/* Add product form */}
      <form onSubmit={handleAddProduct} className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Product Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Stock"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            step="0.01"
            className="form-control"
            placeholder="Price (PKR)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Add
          </button>
        </div>
      </form>

      {/* Products table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Price (PKR)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} style={getRowStyle(p.stock)}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.stock}</td>
              <td>{p.price}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEditClick(p)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancelEdit}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label>Name</label>
                    <input
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Category</label>
                    <input
                      className="form-control"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label>Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
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

export default Products;
