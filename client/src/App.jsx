import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Expense from './pages/Expense';

function App() {
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-grow-1 p-3">
          <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/products" element={<Products />} />
            <Route path="/expense" element={<Expense />} />


            


          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
