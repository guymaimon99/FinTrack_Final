import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ViewGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    progress: '',
    status: ''
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`http://localhost:5001/api/savings-goals/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const calculateProgress = (goal) => {
    const totalIncome = goal.periodDetails.totalIncome;
    const totalExpense = goal.periodDetails.totalExpense;
    const actualSavings = totalIncome - totalExpense;
    const remainingAmount = goal.TargetAmount - actualSavings;
    let progressPercentage = (actualSavings / goal.TargetAmount) * 100;
    progressPercentage = progressPercentage < 0 ? 0 : Math.floor(progressPercentage);
    return { actualSavings, remainingAmount, progressPercentage };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredGoals = goals.filter((goal) => {
    const { actualSavings, progressPercentage } = calculateProgress(goal);
    const isDateMatch = filters.date ? format(new Date(goal.StartDate), 'yyyy-MM-dd') === filters.date : true;
    const isProgressMatch = filters.progress ? 
      (filters.progress === 'below50' && progressPercentage < 50) || 
      (filters.progress === 'above50' && progressPercentage >= 50) : 
      true;
    const isStatusMatch = filters.status ?
      (filters.status === 'completed' && actualSavings >= goal.TargetAmount) ||
      (filters.status === 'ongoing' && actualSavings < goal.TargetAmount) :
      true;
    
    return isDateMatch && isProgressMatch && isStatusMatch;
  });

  return (
    <div className="view-goals min-h-screen bg-gradient-to-br from-teal-100 to-cyan-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-teal-900">My Savings Goals</h1>

        {loading && (
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your goals...</p>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-teal-800">Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-gray-700 font-bold mb-2">Date:</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"  
                  />
                </div>
                <div>
                  <label htmlFor="progress" className="block text-gray-700 font-bold mb-2">Progress:</label>
                  <select
                    id="progress"
                    name="progress"
                    value={filters.progress}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="below50">Below 50%</option>
                    <option value="above50">Above 50%</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" 
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGoals.map((goal) => {
                const { actualSavings, remainingAmount, progressPercentage } = calculateProgress(goal);
                const isCompleted = actualSavings >= goal.TargetAmount;

                return (
                  <div key={goal.GoalID} className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-teal-800 mb-4">{goal.Name}</h2>
                    <p className={`text-lg font-medium mb-2 ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isCompleted ? 'Completed' : 'Ongoing'}
                    </p>
                    <div className="mb-4">
                      <p className="text-gray-500 mb-1">Progress: {progressPercentage}%</p>
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-teal-600'}`}
                          style={{ width: `${progressPercentage}%` }}  
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{goal.Description}</p>
                    <div className="mb-4">
                      <p className="text-gray-500">
                        <span className="font-medium">Start Date:</span> {format(new Date(goal.StartDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Target Date:</span> {format(new Date(goal.TargetDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-500">
                        <span className="font-medium">Target Amount:</span> ₪{goal.TargetAmount.toLocaleString()}
                      </p>
                      {!isCompleted && (
                        <p className="text-gray-500">
                          <span className="font-medium">Until Goal:</span> ₪{remainingAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGoals;