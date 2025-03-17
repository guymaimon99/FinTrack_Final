import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';

const ViewBudget = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        date: ''
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://fintrack-final-2-0xum.onrender.com/api/categories?type=EXPENSE', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch(`https://fintrack-final-2-0xum.onrender.com/api/budgets/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch budgets');
            const data = await response.json();
            setBudgets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getBudgetStatus = (budget) => {
        const today = new Date();
        const startDate = new Date(budget.StartDate);
        const endDate = new Date(budget.EndDate);
        const spentPercentage = (budget.SpentAmount / budget.Amount) * 100;

        if (isBefore(today, startDate)) return 'upcoming';
        if (isAfter(today, endDate)) {
            return spentPercentage <= 100 ? 'achieved' : 'exceeded';
        }
        if (isWithinInterval(today, { start: startDate, end: endDate })) {
            if (spentPercentage >= budget.AlertThreshold) return 'warning';
            return 'ongoing';
        }
        return 'unknown';
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredBudgets = budgets.filter(budget => {
        const matchesCategory = !filters.category || budget.CategoryID.toString() === filters.category;
        const matchesStatus = !filters.status || getBudgetStatus(budget) === filters.status;
        const matchesDate = !filters.date || isWithinInterval(new Date(filters.date), {
            start: new Date(budget.StartDate),
            end: new Date(budget.EndDate)
        });
        
        return matchesCategory && matchesStatus && matchesDate;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">
                        <h2>Loading Budgets</h2>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-budgets">
            <div className="max-w-7xl mx-auto px-4">
                <h1>My Budgets</h1>

                <div className="filters-section">
                    <h2>Filters</h2>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Category:</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.CategoryID} value={category.CategoryID}>
                                        {category.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status:</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Statuses</option>
                                <option value="achieved">Achieved</option>
                                <option value="exceeded">Exceeded</option>
                                <option value="warning">Warning</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="upcoming">Upcoming</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="budgets-grid">
                    {filteredBudgets.map(budget => {
                        const status = getBudgetStatus(budget);
                        const spentPercentage = Math.min((budget.SpentAmount / budget.Amount) * 100, 100);

                        return (
                            <div key={budget.BudgetID} className="budget-card">
                                <div className="budget-header">
                                    <h3>{budget.CategoryName}</h3>
                                    <span className={`status-badge ${status}`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>

                                <div className="budget-progress">
                                    <div className="progress-info">
                                        <span>Progress</span>
                                        <span>{spentPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className={`progress-fill ${status}`}
                                            style={{ width: `${spentPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="budget-details">
                                    <div className="detail-row">
                                        <span>Budget Amount:</span>
                                        <span>₪{budget.Amount.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Spent Amount:</span>
                                        <span>₪{budget.SpentAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Remaining:</span>
                                        <span>₪{(budget.Amount - budget.SpentAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Period:</span>
                                        <span>
                                            {format(new Date(budget.StartDate), 'MMM d')} - {format(new Date(budget.EndDate), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>

                                {budget.SpentAmount >= (budget.Amount * (budget.AlertThreshold / 100)) && (
                                    <div className="alert-message">
                                        Alert: Budget threshold reached!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredBudgets.length === 0 && (
                    <div className="no-budgets">
                        <p>No budgets found. Try adjusting your filters or create a new budget.</p>
                        <button onClick={() => window.location.href = '/set-budget'}>
                            Create New Budget
                        </button>
                    </div>
                )}

                <div className="text-center mt-8">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="back-button"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <style jsx>{`
                .view-budgets {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    padding: 2rem 1rem;
                    font-family: 'Poppins', sans-serif;
                }

                h1 {
                    font-size: 2.5rem;
                    color: white;
                    text-align: center;
                    margin-bottom: 2rem;
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
                    margin-bottom: 1rem;
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
                }

                .filter-group select,
                .filter-group input {
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: Black;
                }

                .budgets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin: 2rem 0;
                }

                .budget-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .budget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .budget-header h3 {
                    font-size: 1.25rem;
                    color: #1e40af;
                    margin: 0;
                }

                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .status-badge.achieved { background: #dcfce7; color: #166534; }
                .status-badge.exceeded { background: #fee2e2; color: #991b1b; }
                .status-badge.warning { background: #fef3c7; color: #92400e; }
                .status-badge.ongoing { background: #dbeafe; color: #1e40af; }
                .status-badge.upcoming { background: #f3f4f6; color: #374151; }

                .budget-progress {
                    margin-bottom: 1.5rem;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    color: #6b7280;
                }

                .progress-bar {
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .progress-fill.achieved { background: #10b981; }
                .progress-fill.exceeded { background: #ef4444; }
                .progress-fill.warning { background: #f59e0b; }
                .progress-fill.ongoing { background: #3b82f6; }
                .progress-fill.upcoming { background: #9ca3af; }

                .budget-details {
                    display: grid;
                    gap: 0.75rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .detail-row span:first-child {
                    color: #6b7280;
                }

                .detail-row span:last-child {
                    color: #1e40af;
                    font-weight: 500;
                }

                .alert-message {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #fee2e2;
                    color: #991b1b;
                    border-radius: 0.5rem;
                    text-align: center;
                    font-weight: 500;
                }

                .no-budgets {
                    text-align: center;
                    color: white;
                    padding: 2rem;
                }

                .back-button {
                    background: white;
                    color: #1e40af;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .back-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

@media (max-width: 640px) {
                    .filters-section {
                        padding: 1rem;
                    }

                    .budget-card {
                        padding: 1.25rem;
                    }

                    .filters-grid {
                        grid-template-columns: 1fr;
                    }

                    h1 {
                        font-size: 2rem;
                    }

                    .budget-header h3 {
                        font-size: 1.1rem;
                    }

                    .status-badge {
                        padding: 0.4rem 0.8rem;
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ViewBudget;