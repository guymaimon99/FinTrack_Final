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
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [chartData, setChartData] = useState({ income: 0, expenses: 0 });
  const [selectedDate, setSelectedDate] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  }));
  const [hasData, setHasData] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleDateChange = (type, value) => {
    setSelectedDate(prev => ({
      ...prev,
      [type]: type === 'month' ? months.indexOf(value) : parseInt(value)
    }));
  };

  const getCurrentMonthRange = () => {
    const firstDay = new Date(selectedDate.year, selectedDate.month, 1);
    const lastDay = new Date(selectedDate.year, selectedDate.month + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  
  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        window.location.href = '/login';
        return;
      }

      // Get user data
      const userResponse = await fetch(`https://fintrack-final-2-0xum.onrender.com/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      setUser(userData);

      // Fetch income
      const incomeResponse = await fetch(
        `https://fintrack-final-2-0xum.onrender.com/api/income/monthly?year=${selectedDate.year}&month=${selectedDate.month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      let monthIncome = 0;
      if (incomeResponse.ok) {
        const incomeData = await incomeResponse.json();
        monthIncome = incomeData.totalIncome || 0;
      }

      // Fetch expenses
      const expenseResponse = await fetch(
        `https://fintrack-final-2-0xum.onrender.com/api/expense/monthly?year=${selectedDate.year}&month=${selectedDate.month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      let monthExpenses = 0;
      if (expenseResponse.ok) {
        const expenseData = await expenseResponse.json();
        monthExpenses = expenseData.totalExpense || 0;
      }

      // Update states
      setMonthlyIncome(monthIncome);
      setMonthlyExpenses(monthExpenses);
      setChartData({
        income: monthIncome,
        expenses: monthExpenses,
      });

      setHasData(monthIncome > 0 || monthExpenses > 0);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setMonthlyIncome(0);
      setMonthlyExpenses(0);
      setChartData({ income: 0, expenses: 0 });
      setHasData(false);

      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  
  

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [selectedDate]); // Refetch when selected date changes

  const calculateMonthlyNetBalance = () => {
    return monthlyIncome - monthlyExpenses;
  };

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Monthly Income vs. Expenses',
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
      title: { 
        display: true, 
        text: 'Monthly Income vs. Expenses',
        font: { size: 16 }
      },
    },
  };

  const NoDataMessage = () => (
    <div className="no-data-message">
      <div className="no-data-content">
        <h3>No Data Available</h3>
        <p>Sorry, but you did not enter any information for {months[selectedDate.month]} {selectedDate.year}</p>
      </div>
      <style jsx>{`
        .no-data-message {
          background: white;
          border-radius: 10px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
        }

        .no-data-content h3 {
          color: #1e40af;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .no-data-content p {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .add-data-button {
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-data-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );

  // Loading state
// Loading state
if (loading) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          <h2>FinTrack</h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="loading-message">Loading your financial data...</p>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          font-family: 'Poppins', sans-serif;
        }

        .loading-content {
          background: white;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          text-align: center;
          position: relative;
          width: 90%;
          max-width: 400px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid #e2e8f0;
          border-top: 5px solid #2563eb;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .loading-text h2 {
          color: #1e40af;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .loading-message {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        }

        .loading-dots {
          display: flex;
          gap: 6px;
        }

        .loading-dots span {
          width: 6px;
          height: 6px;
          background-color: #2563eb;
          border-radius: 50%;
          display: inline-block;
          animation: dots 1.5s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes dots {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .loading-content {
            padding: 2rem;
          }

          .loading-text h2 {
            font-size: 1.25rem;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
}

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchData} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
      <div className="sidebar-header">
        <img src="/images/whiteLogoNoBG.png" alt="FinTrack Logo" className="logo" />
        <h2>FINTRACK</h2>
      </div>
        <ul>
          <li><a href="/add-income">Add Income</a></li>
          <li><a href="/add-expense">Add Expense</a></li>
          <li><a href="/list-income">List Income</a></li>
          <li><a href="/list-expenses">List Expenses</a></li>
          <li><a href="/set-goals">Set Goals</a></li>
          <li><a href="/ViewGoals">View Goals</a></li>
          <li><a href="/set-budget">Set Budget</a></li>
          <li><a href="/view-budget">View Budget</a></li>
          <li>
            <a 
              onClick={handleLogout}
              className="cursor-pointer hover:text-blue-500"
            >
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>Welcome, {user?.Username || 'User'}!</h1>
          <div className="date-selector">
            <select
              value={months[selectedDate.month]}
              onChange={(e) => handleDateChange('month', e.target.value)}
              className="month-select"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              value={selectedDate.year}
              onChange={(e) => handleDateChange('year', e.target.value)}
              className="year-select"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </header>

        <main>
          <div className="grid-container">
            <div className="card">
              <h3>Monthly Income</h3>
              <p className={monthlyIncome > 0 ? 'text-green-600' : ''}>
                ${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card">
              <h3>Monthly Expenses</h3>
              <p className={monthlyExpenses > 0 ? 'text-red-600' : ''}>
                ${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card">
              <h3>Monthly Net Balance</h3>
              <p className={calculateMonthlyNetBalance() >= 0 ? 'text-blue-600' : 'text-red-600'}>
                ${calculateMonthlyNetBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {!hasData ? (
            <NoDataMessage />
          ) : (
            <div className="chart-section">
              <h3>Monthly Income vs. Expenses</h3>
              <div className="chart-container">
                <Pie data={pieData} options={options} />
              </div>
            </div>
          )}
        </main>

        <footer>
          <p>&copy; 2025 FinTrack. All rights reserved.</p>
        </footer>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .chart-section {
          margin-top: 20px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
          
        .chart-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.8);
        }

        .logo {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          display: block;
          object-fit: contain;
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
          border-radius: 40px;
        }

        ul li a:hover {
          background:rgb(23, 45, 142);
        }

        .main-content {
          flex: 1;
          padding: 20px;
        }

        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
          font-size: 1.8rem;
          color: #1e40af;
          margin-bottom: 8px;
        }

        .date-selector {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .month-select,
        .year-select {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          color: #1e40af;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .month-select:hover,
        .year-select:hover {
          border-color: #3b82f6;
        }

        .month-select:focus,
        .year-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card h3 {
          margin-bottom: 10px;
          color: #374151;
          font-size: 1.1rem;
        }

        .card p {
          font-size: 1.5rem;
          font-weight: bold;
        }

        footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            padding: 10px;
          }

          .grid-container {
            grid-template-columns: 1fr;
          }

          .chart-container {
            padding: 10px;
          }

          .date-selector {
            flex-direction: column;
            gap: 0.5rem;
          }

          .month-select,
          .year-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
