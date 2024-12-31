import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(null);

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
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchTotalIncome = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/income/total', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch total income');
        }
        
        const data = await response.json();
        setTotalIncome(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchTotalExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/expense/total', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch total expenses');
        }
        
        const data = await response.json();
        setTotalExpenses(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    checkAuth();
    fetchUserData();
    fetchTotalIncome();
    fetchTotalExpenses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Calculate net balance
  const calculateNetBalance = () => {
    const income = totalIncome && totalIncome.length > 0 ? totalIncome[0].totalIncome : 0;
    const expenses = totalExpenses && totalExpenses.length > 0 ? totalExpenses[0].totalExpense : 0;
    return income - expenses;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">FinTrack</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.FirstName} {user?.LastName}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg font-medium">{user?.Username}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{user?.Email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome && totalIncome.length > 0 
                ? `${totalIncome[0].totalIncome?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} ${totalIncome[0].Currency}`
                : 'No income yet'}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              {totalExpenses && totalExpenses.length > 0 
                ? `${totalExpenses[0].totalExpense?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} ${totalExpenses[0].Currency}`
                : 'No expenses yet'}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Balance</h3>
            <p className={`text-2xl font-bold ${calculateNetBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {`${calculateNetBalance().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ${(totalIncome && totalIncome.length > 0) ? totalIncome[0].Currency : 'USD'}`}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/add-income'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">Add Income</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/add-expense'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">Add Expense</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/list-income'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">List Income</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/list-expenses'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">List Expenses</span>
            </button>

            <button 
              onClick={() => window.location.href = '/set-goals'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">Set Goals</span>
            </button>
    
            <button 
              onClick={() => window.location.href = '/Budget'}
              className="p-4 text-center bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <span className="block text-sm font-medium text-gray-900">View Budget</span>
            </button>   

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;