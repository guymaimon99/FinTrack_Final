import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PieController, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [chartData, setChartData] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        window.location.href = '/login';
      }
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:5001/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err.message);
        setError(err.message);
        if (err.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/login';
        }
      }
    };

    // const fetchTotalIncome = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const response = await fetch('http://localhost:5001/api/income', {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });

    //     if (!response.ok) {
    //       throw new Error('Failed to fetch total income');
    //     }

    //     const data = await response.json();
    //     const total = data.reduce((acc, item) => acc + item.totalExpense, 0);
    //     setTotalIncome(total);
    //   } catch (error) {
    //     console.error('Error fetching total income:', error.message);
    //   }
    // };

    // const fetchTotalExpenses = async () => {
    //   try {
    //     const token = localStorage.getItem('token');
    //     const response = await fetch('http://localhost:5001/api/expense', {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });

    //     if (!response.ok) {
    //       throw new Error('Failed to fetch total expenses');
    //     }

    //     const data = await response.json();
    //     const total = data.reduce((acc, item) => acc + item.totalExpense, 0);
    //     setTotalExpenses(total);
    //   } catch (error) {
    //     console.error('Error fetching total expenses:', error.message);
    //   }
    // };
    const fetchTotalIncome = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/income', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch total income');
        }
    
        const data = await response.json();
        setTotalIncome(data.totalIncome); // קבלת totalIncome מ-JSON
      } catch (error) {
        console.error('Error fetching total income:', error.message);
      }
    };
    
    const fetchTotalExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/expense', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch total expenses');
        }
    
        const data = await response.json();
        setTotalExpenses(data.totalExpense); // קבלת totalExpense מ-JSON
      } catch (error) {
        console.error('Error fetching total expenses:', error.message);
      }
    };
    
    const updateChartData = () => {
      setChartData({ income: totalIncome, expenses: totalExpenses });
    };

    checkAuth();
    fetchUserData();
    fetchTotalIncome();
    fetchTotalExpenses();
    updateChartData();
    setLoading(false);
  }, [totalIncome, totalExpenses]);

  const calculateNetBalance = () => {
    return totalIncome - totalExpenses;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Income vs. Expenses',
        data: [chartData.income, chartData.expenses],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Income vs. Expenses' },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo"></div>
          <h2>FINTRACK</h2>
        </div>
        <ul>
          <li><a href="/add-income">Add Income</a></li>
          <li><a href="/add-expense">Add Expense</a></li>
          <li><a href="/list-income">List Income</a></li>
          <li><a href="/list-expenses">List Expenses</a></li>
          <li><a href="/set-goals">Set Goals</a></li>
          <li><a href="/view-budget">View Budget</a></li>
          <li><a onClick={() => localStorage.clear() && (window.location.href = '/login')}>Logout</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Welcome, {user?.Username}!</h1>
        </header>

        <main>
        <div className="grid-container">
        <div className="card">
          <h3>Total Income</h3>
          <p>
            ${totalIncome ? totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
        <div className="card">
          <h3>Total Expenses</h3>
          <p>
            ${totalExpenses ? totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <p>
            ${totalIncome && totalExpenses ? (totalIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
            <div className="card">
              <h3>Net Balance</h3>
              <p>${calculateNetBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="chart-section">
            <h3>Income vs. Expenses</h3>
            <Pie data={pieData} options={options} />
          </div>

          {/* Goals Section */}
          <div className="goals-section">
            <h3>Your Goals</h3>
            <ul>
              <li>Save for Vacation: $2000</li>
              <li>Pay Off Credit Card: $5000</li>
            </ul>
          </div>
        </main>

        <footer>
          <p>&copy; 2025 FinTrack. All rights reserved.</p>
        </footer>
      </div>

      <style>
        {`
          .dashboard-container {
            display: flex;
            min-height: 100vh;
          }

          .chart-section {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .sidebar {
            background: linear-gradient(to bottom, #2563eb, #1e40af);
            color: white;
            width: 250px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .sidebar-header {
            text-align: center;
            margin-bottom: 20px;
            font-family: 'Arial', sans-serif;
          }

          .logo {
            background: white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            margin: 0 auto;
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;
            flex-grow: 1;
          }

          ul li {
            margin: 15px 0;
            text-align: center;
          }

          ul li a {
            color: white;
            text-decoration: none;
            font-size: 1.1rem;
            display: block;
            padding: 10px;
            transition: 0.3s;
          }

          ul li a:hover {
            background: #3b82f6;
            border-radius: 10px;
          }

          .main-content {
            flex: 1;
            padding: 20px;
          }

          .header {
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 20px;
          }

          .grid-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .goals-section {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
