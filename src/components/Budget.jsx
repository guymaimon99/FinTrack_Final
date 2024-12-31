import React, { useState, useEffect } from 'react';

const Budget = () => {
    // Form state
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        currency: 'ILS',
        rolloverUnused: false,
        alertThreshold: 80
    });

    // App state
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            window.location.href = '/login';
            return;
        }
        
        fetchBudgets();
        fetchCategories();
    }, []);

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/categories?type=expense', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error('Error:', err);
        }
    };

    // Fetch budgets from API
    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch(`http://localhost:5001/api/budgets/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch budgets');
            const data = await response.json();
            setBudgets(data);
        } catch (err) {
            setError('Failed to load budgets');
            console.error('Error:', err);
        }
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch('http://localhost:5001/api/budgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userId: parseInt(userId),
                    amount: parseFloat(formData.amount),
                    categoryId: parseInt(formData.categoryId)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create budget');
            }

            setSuccess('Budget created successfully!');
            setFormData({
                ...formData,
                amount: '',
                categoryId: '',
                endDate: ''
            });
            await fetchBudgets();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate remaining days for budget
    const calculateDaysLeft = (endDate) => {
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate recommended daily spending
    const calculateDailyAmount = (remaining, daysLeft) => {
        if (daysLeft <= 0) return 0;
        return remaining / daysLeft;
    };

    // Get progress bar color
    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Filter budgets based on selected category
    const getFilteredBudgets = () => {
        if (selectedCategory === 'all') return budgets;
        return budgets.filter(budget => budget.CategoryID === parseInt(selectedCategory));
    };

    // Handle budget rollover
    const handleRollover = async (budget) => {
        if (!budget.remainingAmount || budget.remainingAmount <= 0) return;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch('http://localhost:5001/api/budgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    categoryId: budget.CategoryID,
                    amount: budget.remainingAmount,
                    currency: budget.Currency,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    rolloverUnused: true,
                    alertThreshold: budget.AlertThreshold
                }),
            });

            if (!response.ok) throw new Error('Failed to rollover budget');
            
            setSuccess('Budget rolled over successfully!');
            await fetchBudgets();
        } catch (err) {
            setError('Failed to rollover budget');
            console.error('Error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <p className="mt-2 text-sm text-gray-600">Track your spending and stay within budget</p>
                </div>

                {/* Create Budget Form */}
                <div className="bg-white shadow-sm rounded-lg mb-8 p-6">
                    <h2 className="text-xl font-semibold mb-4">Create New Budget</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.CategoryID} value={category.CategoryID}>
                                            {category.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget Amount ({formData.currency})
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    min={formData.startDate}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="rolloverUnused"
                                    checked={formData.rolloverUnused}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    Roll over unused budget to next period
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Budget'}
                        </button>
                    </form>
                </div>

                {/* Filter Section */}
                <div className="mb-6 flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by Category:
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category.CategoryID} value={category.CategoryID}>
                                {category.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Budgets List */}
                <div className="space-y-6">
                    {getFilteredBudgets().map(budget => {
                        const daysLeft = calculateDaysLeft(budget.EndDate);
                        const dailyAmount = calculateDailyAmount(budget.remainingAmount, daysLeft);
                        
                        return (
                            <div key={budget.BudgetID} className="bg-white shadow-sm rounded-lg p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold">{budget.CategoryName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(budget.StartDate).toLocaleDateString()} - {new Date(budget.EndDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">
                                            {budget.remainingAmount.toLocaleString()} {budget.Currency} remaining
                                        </p>
                                        {daysLeft > 0 && (
                                            <p className="text-sm text-gray-600">
                                                Recommended daily: {dailyAmount.toFixed(2)} {budget.Currency}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`${getProgressColor(budget.progressPercentage)} h-2.5 rounded-full transition-all duration-500`}
                                            style={{ width: `${Math.min(budget.progressPercentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                                        <span>{budget.progressPercentage.toFixed(1)}% used</span>
                                        <span>{daysLeft} days remaining</span>
                                    </div>
                                </div>

                                {/* Budget Details */}
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Budget</p>
                                        <p className="font-semibold">
                                            {budget.Amount.toLocaleString()} {budget.Currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Spent Amount</p>
                                        <p className="font-semibold">
                                            {budget.SpentAmount.toLocaleString()} {budget.Currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Days with Expenses</p>
                                        <p className="font-semibold">{budget.DaysWithExpenses} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Average Daily Spending</p>
                                        <p className="font-semibold">
                                            {(budget.SpentAmount / Math.max(budget.DaysWithExpenses, 1)).toFixed(2)} {budget.Currency}
                                        </p>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {budget.needsAlert && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                                        Warning: You've exceeded your budget by {Math.abs(budget.remainingAmount).toLocaleString()} {budget.Currency}
                                        {daysLeft > 0 ? ` with ${daysLeft} days remaining` : ''}.
                                    </div>
                                )}

                                {budget.isOverBudget && (
                                    <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                                        Alert: You've used {budget.progressPercentage.toFixed(1)}% of your budget
                                    </div>
                                )}

                                {/* Budget Actions */}
                                <div className="mt-4 flex justify-end space-x-3">
                                    {budget.RolloverUnused && budget.EndDate < new Date().toISOString() && budget.remainingAmount > 0 && (
                                        <button
                                            onClick={() => handleRollover(budget)}
                                            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700"
                                        >
                                            Rollover Remaining Amount
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {getFilteredBudgets().length === 0 && (
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <p className="text-center text-gray-500">
                                No budgets found. Create your first budget above!
                            </p>
                        </div>
                    )}
                </div>

                {/* Budget Summary */}
                {getFilteredBudgets().length > 0 && (
                    <div className="bg-white shadow-sm rounded-lg mt-8 p-6">
                        <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Total Budgeted</p>
                                <p className="text-2xl font-bold">
                                    {getFilteredBudgets()
                                        .reduce((sum, b) => sum + b.Amount, 0)
                                        .toLocaleString()}{' '}
                                    {getFilteredBudgets()[0]?.Currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold">
                                    {getFilteredBudgets()
                                        .reduce((sum, b) => sum + b.SpentAmount, 0)
                                        .toLocaleString()}{' '}
                                    {getFilteredBudgets()[0]?.Currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Remaining</p>
                                <p className="text-2xl font-bold">
                                    {getFilteredBudgets()
                                        .reduce((sum, b) => sum + b.remainingAmount, 0)
                                        .toLocaleString()}{' '}
                                    {getFilteredBudgets()[0]?.Currency}
                                </p>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                            <div className="space-y-4">
                                {getFilteredBudgets().map(budget => (
                                    <div key={budget.BudgetID} className="flex items-center gap-4">
                                        <div className="w-32 text-sm text-gray-600">{budget.CategoryName}</div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`${getProgressColor(budget.progressPercentage)} h-2 rounded-full`}
                                                    style={{ width: `${Math.min(budget.progressPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-32 text-right">
                                            <span className="text-sm font-medium">
                                                {budget.progressPercentage.toFixed(1)}%
                                            </span>
                                            <span className="text-sm text-gray-600 ml-1">used</span>
                                        </div>
                                        <div className="w-40 text-right text-sm text-gray-600">
                                            {budget.SpentAmount.toLocaleString()} / {budget.Amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        Back to Dashboard
                    </button>
                    <div className="space-x-4">
                        <button
                            onClick={() => fetchBudgets()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Refresh Budgets
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Budget;