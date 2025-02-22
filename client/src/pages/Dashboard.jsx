// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [sales, setSales] = useState([]);

  // For custom date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredSales, setFilteredSales] = useState([]);

  // Fetch all sales once on mount
  useEffect(() => {
    fetchSales();
  }, []);

  // Recompute filteredSales whenever date range or sales array changes
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredSales([]);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Include the entire end day
    end.setHours(23, 59, 59, 999);

    const result = sales.filter((s) => {
      const saleDate = new Date(s.saleDate);
      return saleDate >= start && saleDate <= end;
    });
    setFilteredSales(result);
  }, [startDate, endDate, sales]);

  // Fetch sales from server
  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sales');
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: dayDiff to measure how many days since the sale
  const now = new Date();
  const dayDiff = (someDate) => (now - someDate) / (1000 * 60 * 60 * 24);

  // Define date checks
  const isToday = (date) =>
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isLast7Days = (date) => dayDiff(date) < 7;
  const isLast30Days = (date) => dayDiff(date) < 30;
  const isLast365Days = (date) => dayDiff(date) < 365;

  // Summations for daily, weekly, monthly, yearly using totalAmount & totalProfit
  const dailySales = sales
    .filter((s) => isToday(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const dailyProfit = sales
    .filter((s) => isToday(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalProfit || 0), 0);

  const weeklySales = sales
    .filter((s) => isLast7Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const weeklyProfit = sales
    .filter((s) => isLast7Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalProfit || 0), 0);

  const monthlySales = sales
    .filter((s) => isLast30Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const monthlyProfit = sales
    .filter((s) => isLast30Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalProfit || 0), 0);

  const yearlySales = sales
    .filter((s) => isLast365Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const yearlyProfit = sales
    .filter((s) => isLast365Days(new Date(s.saleDate)))
    .reduce((acc, s) => acc + (s.totalProfit || 0), 0);

  // Summation for the custom date range
  const rangeSalesSum = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const rangeProfitSum = filteredSales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);

  // Handle Delete in filtered table
  const handleDeleteSale = async (saleId) => {
    try {
      await axios.delete(`http://localhost:5000/api/sales/${saleId}`);
      // re-fetch to refresh the data
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="row my-3">
        {/* Daily */}
        <div className="col-md-3 mb-3">
          <div className="p-3 bg-primary text-white rounded">
            <h5>Today Sales</h5>
            <p>PKR {dailySales}</p>
            <h6>Profit: PKR {dailyProfit}</h6>
          </div>
        </div>

        {/* Weekly */}
        <div className="col-md-3 mb-3">
          <div className="p-3 bg-success text-white rounded">
            <h5>Last 7 Days Sales</h5>
            <p>PKR {weeklySales.toFixed(2)}</p>
            <h6>Profit: PKR {weeklyProfit.toFixed(2)}</h6>
          </div>
        </div>

        {/* Monthly */}
        <div className="col-md-3 mb-3">
          <div className="p-3 bg-warning text-dark rounded">
            <h5>Last 30 Days Sales</h5>
            <p>PKR {monthlySales.toFixed(2)}</p>
            <h6>Profit: PKR {monthlyProfit.toFixed(2)}</h6>
          </div>
        </div>

        {/* Yearly */}
        <div className="col-md-3 mb-3">
          <div className="p-3 bg-danger text-white rounded">
            <h5>Last 365 Days Sales</h5>
            <p>PKR {yearlySales.toFixed(2)}</p>
            <h6>Profit: PKR {yearlyProfit.toFixed(2)}</h6>
          </div>
        </div>
      </div>

      {/* Date range filter */}
      <div className="mt-4 mb-3">
        <h4>Filter by Date Range</h4>
        <div className="row g-2">
          <div className="col-md-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summaries & Table for custom range */}
      {startDate && endDate && (
        <div>
          <p>
            Sales in Range: PKR {rangeSalesSum} | Profit in Range: PKR {rangeProfitSum}
          </p>

          {/* Table of filtered sales with a DELETE button */}
          <table className="table table-bordered mt-2">
            <thead>
              <tr>
                <th>Product(s)</th>
                <th>Buyer</th>
                <th>Quantity</th>
                <th>Sale Price</th>
                <th>Total</th>
                <th>Profit</th>
                <th>Sale Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s._id}>
                  {/* If multi-product, we can show each item’s product name in separate lines */}
                  <td>
                    {s.items?.map((item, i) => (
                      <div key={i}>{item.product?.name}</div>
                    ))}
                  </td>
                  <td>{s.buyerName}</td>
                  <td>
                    {s.items?.map((item, i) => (
                      <div key={i}>{item.quantity}</div>
                    ))}
                  </td>
                  <td>
                    {s.items?.map((item, i) => (
                      <div key={i}>{item.salePrice}</div>
                    ))}
                  </td>
                  <td>{s.totalAmount}</td>
                  <td>{s.totalProfit}</td>
                  <td>{new Date(s.saleDate).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteSale(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredSales.length && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No sales in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
