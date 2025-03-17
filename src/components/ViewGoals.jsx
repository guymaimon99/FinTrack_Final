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

  // New state for modals and notifications
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    description: ''
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`https://fintrack-final-2-0xum.onrender.com/api/savings-goals/${userId}`, {
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

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setEditFormData({
      name: goal.Name,
      targetAmount: goal.TargetAmount,
      startDate: goal.StartDate.split('T')[0],
      targetDate: goal.TargetDate.split('T')[0],
      description: goal.Description
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

// Updated handleUpdateGoal function
const handleUpdateGoal = async () => {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Format the data to match the database schema
    const updatedGoalData = {
      GoalID: selectedGoal.GoalID,
      UserID: parseInt(userId),
      Name: editFormData.name,
      TargetAmount: parseFloat(editFormData.targetAmount),
      CurrentAmount: selectedGoal.CurrentAmount || 0, // Keep existing CurrentAmount
      Currency: 'USD', // Or get from user preferences
      StartDate: editFormData.startDate,
      TargetDate: editFormData.targetDate,
      Priority: selectedGoal.Priority || 0,
      Status: 'ACTIVE',
      Description: editFormData.description
    };

    console.log('Updating goal with data:', updatedGoalData);

    const response = await fetch(`https://fintrack-final-2-0xum.onrender.com/api/savings-goals/${selectedGoal.GoalID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedGoalData)
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update goal');
      } else {
        const textError = await response.text();
        console.error('Raw error response:', textError);
        throw new Error('Server error occurred');
      }
    }

    // Update local state
    const updatedGoals = goals.map(goal => 
      goal.GoalID === selectedGoal.GoalID 
        ? { 
            ...goal,
            Name: editFormData.name,
            TargetAmount: parseFloat(editFormData.targetAmount),
            StartDate: editFormData.startDate,
            TargetDate: editFormData.targetDate,
            Description: editFormData.description
          }
        : goal
    );

    setGoals(updatedGoals);
    setShowEditModal(false);
    showNotification('success', 'Goal updated successfully!');
  } catch (error) {
    console.error('Error updating goal:', error);
    showNotification('error', error.message || 'Failed to update goal');
  }
};

// Updated handleDeleteGoal function
const handleDeleteGoal = async () => {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log(`Deleting goal: ${selectedGoal.GoalID} for user: ${userId}`);

    const response = await fetch(`https://fintrack-final-2-0xum.onrender.com/api/savings-goals/${selectedGoal.GoalID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // Removed body from DELETE request as it's not typically needed
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete goal');
      } else {
        const textError = await response.text();
        console.error('Raw error response:', textError);
        throw new Error('Server error occurred');
      }
    }

    setGoals(prevGoals => prevGoals.filter(goal => goal.GoalID !== selectedGoal.GoalID));
    setShowDeleteModal(false);
    showNotification('success', 'Goal deleted successfully!');
  } catch (error) {
    console.error('Error deleting goal:', error);
    showNotification('error', error.message || 'Failed to delete goal');
  }
};

  const calculateProgress = (goal) => {
    const totalIncome = goal.periodDetails.totalIncome;
    const totalExpense = goal.periodDetails.totalExpense;
    const actualSavings = totalIncome - totalExpense;
    const remainingAmount = goal.TargetAmount - actualSavings;
    let progressPercentage = (actualSavings / goal.TargetAmount) * 100;
    progressPercentage = progressPercentage < 0 ? 0 : Math.floor(progressPercentage);
    return { actualSavings, remainingAmount, progressPercentage };
  };

  const getGoalStatus = (goal, actualSavings) => {
    const currentDate = new Date();
    const targetDate = new Date(goal.TargetDate);
    const isCompleted = actualSavings >= goal.TargetAmount;
    
    if (isCompleted) {
      return 'completed';
    } else if (currentDate > targetDate) {
      return 'incomplete';
    } else {
      return 'ongoing';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredGoals = goals.filter((goal) => {
    const { actualSavings, progressPercentage } = calculateProgress(goal);
    const goalStatus = getGoalStatus(goal, actualSavings);
    
    const isDateMatch = filters.date ? format(new Date(goal.StartDate), 'yyyy-MM-dd') === filters.date : true;
    const isProgressMatch = filters.progress ? 
      (filters.progress === 'below50' && progressPercentage < 50) || 
      (filters.progress === 'above50' && progressPercentage >= 50) : 
      true;
    const isStatusMatch = filters.status ? goalStatus === filters.status : true;
    
    return isDateMatch && isProgressMatch && isStatusMatch;
  });

  return (
    <div className="view-goals">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">My Savings Goals</h1>

        {loading && (
          <div className="text-center">
            <div className="loader"></div>
            <p className="loading-text">Loading your goals...</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="filters-section">
              <h2 className="text-2xl font-bold mb-4">Filters</h2>
              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="date">Date:</label>
                  <input 
                    type="date" 
                    id="date" 
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="progress">Progress:</label>
                  <select
                    id="progress"
                    name="progress"
                    value={filters.progress}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="below50">Below 50%</option>
                    <option value="above50">Above 50%</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="goals-grid">
              {filteredGoals.map((goal) => {
                const { actualSavings, remainingAmount, progressPercentage } = calculateProgress(goal);
                const status = getGoalStatus(goal, actualSavings);

                return (
                  <div key={goal.GoalID} className="goal-card">
                    <h2 className="goal-title">{goal.Name}</h2>
                    <div className={`goal-status ${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    
                    <div className="progress-container">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${status}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="goal-description">{goal.Description}</p>

                    <div className="goal-info">
                      <div className="info-row">
                        <span className="label">Start Date:</span>
                        <span>{format(new Date(goal.StartDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Target Date:</span>
                        <span>{format(new Date(goal.TargetDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Target Amount:</span>
                        <span>₪{goal.TargetAmount.toLocaleString()}</span>
                      </div>
                      {status !== 'completed' && (
                        <div className="info-row remaining">
                          <span className="label">Remaining:</span>
                          <span>₪{remainingAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditClick(goal)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(goal)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal-content">
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete this goal?</p>
          <div className="modal-buttons">
            <button onClick={handleDeleteGoal} className="confirm-button">Yes, Delete</button>
            <button onClick={() => setShowDeleteModal(false)} className="cancel-button">Cancel</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className={`modal ${showEditModal ? 'show' : ''}`}>
        <div className="modal-content">
          <h2>Edit Goal</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateGoal(); }}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Target Amount:</label>
              <input
                type="number"
                name="targetAmount"
                value={editFormData.targetAmount}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={editFormData.startDate}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Target Date:</label>
              <input
                type="date"
                name="targetDate"
                value={editFormData.targetDate}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="modal-buttons">
              <button type="submit" className="confirm-button">Update</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <style>{`
        .view-goals {
          min-height: 100vh;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          padding: 2rem 1rem;
        }

        .max-w-7xl {
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          font-size: 2.5rem;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }

        .loading-text {
          color: white;
          font-size: 1.1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #fee2e
      }
.error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          margin: 2rem 0;
        }

        .filters-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .filters-section h2 {
          color: white;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          color: white;
          font-size: 1.1rem;
        }

        .filter-group input,
        .filter-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: black;
          transition: all 0.3s ease;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }

        .goal-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .goal-card:hover {
          transform: translateY(-5px);
        }

        .goal-title {
          font-size: 1.25rem;
          color: #1e40af;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .goal-status {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .goal-status.completed {
          background: rgb(0, 255, 89);
          color: rgb(0, 0, 0);
        }

        .goal-status.ongoing {
          background: #fff7ed;
          color: rgb(0, 149, 255);
        }

        .goal-status.incomplete {
          background: rgb(255, 0, 0);
          color: rgb(0, 0, 0);
        }

        .progress-container {
          margin-bottom: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .progress-fill.completed {
          background: #10b981;
        }

        .progress-fill.ongoing {
          background: #3b82f6;
        }

        .progress-fill.incomplete {
          background: #ef4444;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          justify-content: flex-end;
        }

        .edit-button,
        .delete-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-button {
          background: #3b82f6;
          color: white;
        }

        .delete-button {
          background: #ef4444;
          color: white;
        }

        .edit-button:hover,
        .delete-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal.show {
          display: flex;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-content h2 {
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .confirm-button,
        .cancel-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirm-button {
          background: #3b82f6;
          color: white;
        }

        .cancel-button {
          background: #9ca3af;
          color: white;
        }

        .notification {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          color: white;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .notification.success {
          background: #10b981;
        }

        .notification.error {
          background: #ef4444;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .back-button {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: white;
          color: #1e40af;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 2rem;
        }

        .back-button:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .view-goals {
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .filters-section {
            padding: 1.5rem;
          }

          .goal-card {
            padding: 1.25rem;
          }

          .modal-content {
            padding: 1.5rem;
            margin: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .edit-button,
          .delete-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewGoals;          