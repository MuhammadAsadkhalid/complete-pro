// src/components/TopBar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { BellIcon, UserCircleIcon, BoltIcon, KeyIcon, ArrowLeftOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const STOCK_THRESHOLD = 7; // Set threshold to 7 items

export default function TopBar() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newAdminData, setNewAdminData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const products = response.data;
      // Filter products with stock less than threshold
      const lowStock = products.filter(product => {
        const stockLevel = Number(product.stock);
        return !isNaN(stockLevel) && stockLevel <= STOCK_THRESHOLD;
      });
      
      setLowStockProducts(lowStock);
      
      // If there are no low stock products, close the notifications dropdown
      if (lowStock.length === 0) {
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Set up event listener for product updates
  useEffect(() => {
    fetchLowStockProducts(); // Initial fetch

    // Create event listener for product updates
    const handleProductUpdate = () => {
      fetchLowStockProducts();
    };

    // Add event listener
    window.addEventListener('productUpdated', handleProductUpdate);

    // Set up periodic refresh
    const interval = setInterval(fetchLowStockProducts, 5000); // Check every 5 seconds

    // Cleanup
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      clearInterval(interval);
    };
  }, []);

  // Function to dispatch product update event (to be called after product updates)
  const notifyProductUpdate = () => {
    window.dispatchEvent(new Event('productUpdated'));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    try {
      await axios.put('/api/auth/password', passwordData);
      alert('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating password');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (newAdminData.password !== newAdminData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await axios.post('/api/auth/create-admin', newAdminData);
      alert('Admin account created successfully!');
      setShowCreateAdminModal(false);
      setNewAdminData({ username: '', password: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating admin account');
    }
  };

  return (
    <div className="h-16 fixed w-full z-10 bg-gradient-to-r from-blue-600 to-blue-800 border-b border-blue-700 pl-64">
      <div className="px-6 h-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BoltIcon className="h-8 w-8 text-yellow-300" />
          <div>
            <h1 className="text-2xl font-bold text-white">Al-Zafar Electronics</h1>
            <p className="text-sm text-blue-100">Your Trusted Electronics Partner</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="p-2 hover:bg-blue-700 rounded-lg relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-6 w-6 text-white" />
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && lowStockProducts.length > 0 && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Low Stock Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {lowStockProducts.map(product => (
                    <div key={product._id} className="px-4 py-2 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">
                        {product.name}
                      </p>
                      <p className="text-xs text-red-600">
                        Only {product.stock} items left in stock
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2 hover:bg-blue-700 rounded-lg px-3 py-2"
              onClick={() => setShowAuthMenu(!showAuthMenu)}
            >
              <UserCircleIcon className="h-8 w-8 text-white" />
              <span className="text-sm font-medium text-white">Admin</span>
            </button>

            {/* Auth Menu Dropdown */}
            {showAuthMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setShowAuthMenu(false);
                    setShowCreateAdminModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Create Admin Account</span>
                </button>
                <button
                  onClick={() => {
                    setShowAuthMenu(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <KeyIcon className="h-5 w-5" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Create Admin Account</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAdminData.username}
                  onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAdminData.confirmPassword}
                  onChange={(e) => setNewAdminData({ ...newAdminData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
