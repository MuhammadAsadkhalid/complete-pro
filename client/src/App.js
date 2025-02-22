// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import our components/pages
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';

function App() {
  return (
    <Router>
      {/* Page container: row with sidebar + main content */}
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-grow-1">
          {/* Top bar */}
          <TopBar />

          {/* Page content/routes */}
          <div className="p-3">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/products" element={<Products />} />
              {/* Redirect root to /dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
