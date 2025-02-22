'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'
  const [stats, setStats] = useState({
    today: { sales: 0, profit: 0, items: 0 },
    week: { sales: 0, profit: 0, items: 0 },
    month: { sales: 0, profit: 0, items: 0 }
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (sales.length > 0 && products.length > 0) {
      calculateStats();
      prepareChartData();
    }
  }, [sales, products, timeRange]);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get('/api/sales'),
        axios.get('/api/products')
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const calculateStats = () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      const newStats = {
        today: { sales: 0, profit: 0, items: 0 },
        week: { sales: 0, profit: 0, items: 0 },
        month: { sales: 0, profit: 0, items: 0 }
      };

      if (!Array.isArray(sales)) return newStats;

      sales.forEach(sale => {
        try {
          if (!sale || !sale.date) return;

          const saleDate = new Date(sale.date);
          const saleDay = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
          const saleTotal = Number(sale.total) || 0;
          const itemCount = sale.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
          
          // Calculate profit for this sale
          const profit = sale.items?.reduce((sum, item) => {
            const product = products.find(p => p._id === (item.productId || item.product?._id));
            if (product) {
              const costPrice = Number(product.price) || 0;
              const salePrice = Number(item.salePrice) || 0;
              const quantity = Number(item.quantity) || 0;
              return sum + ((salePrice - costPrice) * quantity);
            }
            return sum;
          }, 0) || 0;

          // Today's stats - compare dates using getTime()
          if (saleDay.getTime() === today.getTime()) {
            newStats.today.sales += saleTotal;
            newStats.today.profit += profit;
            newStats.today.items += itemCount;
          }

          // Week's stats
          if (saleDate >= weekAgo) {
            newStats.week.sales += saleTotal;
            newStats.week.profit += profit;
            newStats.week.items += itemCount;
          }

          // Month's stats
          if (saleDate >= monthAgo) {
            newStats.month.sales += saleTotal;
            newStats.month.profit += profit;
            newStats.month.items += itemCount;
          }
        } catch (err) {
          console.error('Error processing sale:', sale, err);
        }
      });

      // Fetch expenses and deduct from profit
      axios.get('/api/expenses')
        .then(response => {
          const expenses = response.data;
          if (Array.isArray(expenses)) {
            expenses.forEach(expense => {
              const expenseDate = new Date(expense.expenseDate);
              const expenseDay = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
              const expenseAmount = Number(expense.amount) || 0;

              // Deduct expense from today's profit
              if (expenseDay.getTime() === today.getTime()) {
                newStats.today.profit -= expenseAmount;
              }

              // Deduct from week's profit
              if (expenseDate >= weekAgo) {
                newStats.week.profit -= expenseAmount;
              }

              // Deduct from month's profit
              if (expenseDate >= monthAgo) {
                newStats.month.profit -= expenseAmount;
              }
            });
          }
          setStats(newStats);
        })
        .catch(err => {
          console.error('Error fetching expenses:', err);
          setStats(newStats);
        });

    } catch (err) {
      console.error('Error calculating stats:', err);
      setStats({
        today: { sales: 0, profit: 0, items: 0 },
        week: { sales: 0, profit: 0, items: 0 },
        month: { sales: 0, profit: 0, items: 0 }
      });
    }
  };

  const calculateProfit = (sale) => {
    if (!sale || !sale.items) return 0;
    
    return sale.items.reduce((sum, item) => {
      try {
        if (!item || !item.product || !item.quantity) return sum;
        
        const product = products.find(p => p._id === item.product._id);
        if (product) {
          const profitPerItem = (item.salePrice || 0) - (product.price || 0);
          return sum + (profitPerItem * item.quantity);
        }
        return sum;
      } catch (err) {
        console.error('Error calculating item profit:', item, err);
        return sum;
      }
    }, 0);
  };

  const prepareChartData = () => {
    try {
      const periods = {
        day: { unit: 'hour', count: 24, format: (date) => `${date.getHours()}:00` },
        week: { unit: 'day', count: 7, format: (date) => date.toLocaleDateString('en-US', { weekday: 'short' }) },
        month: { unit: 'day', count: 30, format: (date) => date.getDate() }
      };

      const period = periods[timeRange];
      const now = new Date();
      const labels = [];
      const salesData = new Array(period.count).fill(0);
      const profitData = new Array(period.count).fill(0);

      // Create labels
      for (let i = period.count - 1; i >= 0; i--) {
        const date = new Date(now);
        if (timeRange === 'day') {
          date.setHours(now.getHours() - i, 0, 0, 0);
        } else {
          date.setHours(0, 0, 0, 0);
          date.setDate(now.getDate() - i);
        }
        labels.push(period.format(date));
      }

      // Fill data
      sales.forEach(sale => {
        try {
          const saleDate = new Date(sale.date);
          let index;

          if (timeRange === 'day') {
            // For daily view, compare hours
            const hourDiff = Math.floor((now - saleDate) / (60 * 60 * 1000));
            index = period.count - 1 - hourDiff;
          } else {
            // For weekly and monthly view, compare days
            const dayDiff = Math.floor((now - saleDate) / (24 * 60 * 60 * 1000));
            index = period.count - 1 - dayDiff;
          }

          if (index >= 0 && index < period.count) {
            salesData[index] += sale.total || 0;
            profitData[index] += calculateProfit(sale);
          }
        } catch (err) {
          console.error('Error processing sale for chart:', sale, err);
        }
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sales',
            data: salesData,
            borderColor: '#2563eb',
            tension: 0.4,
          },
          {
            label: 'Profit',
            data: profitData,
            borderColor: '#10b981',
            tension: 0.4,
          }
        ]
      });
    } catch (err) {
      console.error('Error preparing chart data:', err);
      setChartData(null);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales & Profit Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Add this helper function to safely format numbers
  const formatNumber = (value) => {
    if (value === undefined || value === null) return "0.00";
    return Number(value).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex space-x-4">
        <button
          onClick={() => setTimeRange('day')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'day'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'week'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'month'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-blue-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Sales</p>
              <p className="text-2xl font-semibold text-blue-900">
                PKR {formatNumber(stats?.[timeRange]?.sales)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Profit</p>
              <p className="text-2xl font-semibold text-green-900">
                PKR {formatNumber(stats?.[timeRange]?.profit)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Items Sold</p>
              <p className="text-2xl font-semibold text-purple-900">
                {stats?.[timeRange]?.items || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales & Profit Chart */}
      <div className="card">
        {chartData && <Line options={chartOptions} data={chartData} />}
      </div>

      {/* Recent Sales Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(sale?.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale?.buyerName}</td>
                  <td className="px-6 py-4">
                    {sale?.items?.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item?.product?.name} x {item?.quantity || 0}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    PKR {formatNumber(sale?.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    PKR {formatNumber(calculateProfit(sale))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 