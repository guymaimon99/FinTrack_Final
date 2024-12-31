import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SetGoals = () => {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
        description: '',
        priority: '0',
        currency: 'USD'
    });

    const [goals, setGoals] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProgress, setSelectedProgress] = useState('all');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            window.location.href = '/login';
            return;
        }
        
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setIsUpdating(true);
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
            setError('Failed to load goals');
            console.error('Error fetching goals:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch('http://localhost:5001/api/savings-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userId: parseInt(userId),
                    targetAmount: parseFloat(formData.targetAmount),
                    priority: parseInt(formData.priority)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create goal');
            }

            const data = await response.json();
            setSuccess(`Goal created successfully! Current progress: ${data.progressPercentage.toFixed(1)}%`);
            
            setFormData({
                name: '',
                targetAmount: '',
                startDate: new Date().toISOString().split('T')[0],
                targetDate: '',
                description: '',
                priority: '0',
                currency: 'USD'
            });

            await fetchGoals();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filterGoalsByProgress = (goals) => {
        return {
            starting: goals.filter(goal => goal.progressPercentage <= 33),
            progressing: goals.filter(goal => goal.progressPercentage > 33 && goal.progressPercentage <= 66),
            nearlyDone: goals.filter(goal => goal.progressPercentage > 66 && goal.progressPercentage < 100),
            completed: goals.filter(goal => goal.progressPercentage === 100),
            overachieved: goals.filter(goal => goal.progressPercentage > 100)
        };
    };

    const getFilteredGoals = () => {
        const allGoals = filterGoalsByProgress(goals);
        switch(selectedProgress) {
            case 'starting': return allGoals.starting;
            case 'progressing': return allGoals.progressing;
            case 'nearlyDone': return allGoals.nearlyDone;
            case 'completed': return allGoals.completed;
            case 'overachieved': return allGoals.overachieved;
            default: return goals;
        }
    };

    const progressCategories = [
        { id: 'starting', label: 'Starting (0-33%)', color: 'red' },
        { id: 'progressing', label: 'Progressing (34-66%)', color: 'yellow' },
        { id: 'nearlyDone', label: 'Nearly Done (67-99%)', color: 'blue' },
        { id: 'completed', label: 'Completed (100%)', color: 'green' },
        { id: 'overachieved', label: 'Over 100%', color: 'purple' }
    ];

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Set document title
        doc.setFontSize(18);
        doc.text('Savings Goals Report', 14, 22);

        // Current date
        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Report Generated: ${currentDate}`, 14, 30);

        // Prepare goals data for PDF
        const goalsData = getFilteredGoals().map(goal => [
            goal.Name,
            `${goal.TargetAmount.toLocaleString()} ${goal.Currency}`,
            `${goal.CurrentAmount.toLocaleString()} ${goal.Currency}`,
            `${goal.progressPercentage.toFixed(1)}%`,
            `${goal.periodDetails.totalIncome.toLocaleString()} ${goal.Currency}`,
            `${goal.periodDetails.totalExpense.toLocaleString()} ${goal.Currency}`,
            new Date(goal.StartDate).toLocaleDateString(),
            new Date(goal.TargetDate).toLocaleDateString()
        ]);

        // Add goals table
        doc.autoTable({
            startY: 40,
            head: [['Goal Name', 'Target', 'Current', 'Progress', 'Income', 'Expenses', 'Start Date', 'Target Date']],
            body: goalsData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            styles: { fontSize: 8 }
        });

        // Save the PDF
        doc.save('Savings_Goals_Report.pdf');
    };

    const handleBackToDashboard = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
                        <p className="mt-2 text-sm text-gray-600">Track your financial goals and progress</p>
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => fetchGoals()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Progress'}
                        </button>
                        <button 
                            onClick={handleExportPDF}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Export to PDF
                        </button>
                        <button 
                            onClick={handleBackToDashboard}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Create Goal Form */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Goal Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                                <input
                                    type="number"
                                    name="targetAmount"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.targetAmount}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                                <input
                                    type="date"
                                    name="targetDate"
                                    required
                                    min={formData.startDate}
                                    value={formData.targetDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="0">Low Priority</option>
                                <option value="1">Medium Priority</option>
                                <option value="2">High Priority</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {error && <div className="text-red-600 mb-4">{error}</div>}
                        {success && <div className="text-green-600 mb-4">{success}</div>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Goal'}
                        </button>
                    </form>
                </div>

                {/* Progress Filter */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-3">Filter by Progress</h3>
                    <div className="flex flex-wrap gap-2">
                        {progressCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedProgress(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    selectedProgress === category.id 
                                        ? `bg-${category.color}-500 text-white` 
                                        : `bg-${category.color}-100 text-${category.color}-800 hover:bg-${category.color}-200`
                                }`}
                            >
                                {category.label}
                                <span className="ml-2 bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs">
                                    {filterGoalsByProgress(goals)[category.id === 'all' ? 'starting' : category.id]?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Goals List */}
                <div className="space-y-6">
                    {getFilteredGoals().map(goal => {
                        const progress = goal.progressPercentage;
                        let progressColor;
                        let progressLabel;

                        if (progress <= 33) {
                            progressColor = 'bg-red-500';
                            progressLabel = 'Starting';
                        } else if (progress <= 66) {
                            progressColor = 'bg-yellow-500';
                            progressLabel = 'Progressing';
                        } else if (progress < 100) {
                            progressColor = 'bg-blue-500';
                            progressLabel = 'Nearly Done';
                        } else if (progress === 100) {
                            progressColor = 'bg-green-500';
                            progressLabel = 'Completed';
                        } else {
                            progressColor = 'bg-purple-500';
                            progressLabel = 'Over 100%';
                        }

                        return ( <div key={goal.GoalID} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{goal.Name}</h3>
                                    <p className="text-gray-600">{goal.Description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    progress >= 100 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {progress.toFixed(1)}% - {progressLabel}
                                </span>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`${progressColor} h-2.5 rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Target Amount</p>
                                    <p className="font-semibold">
                                        {goal.TargetAmount.toLocaleString()} {goal.Currency}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {progress < 100 
                                            ? `${(goal.TargetAmount - goal.CurrentAmount).toLocaleString()} ${goal.Currency} remaining`
                                            : 'Target achieved!'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Current Savings</p>
                                    <p className="font-semibold">
                                        {goal.CurrentAmount.toLocaleString()} {goal.Currency}
                                    </p>
                                    {goal.periodDetails && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            <p>Total Income: {goal.periodDetails.totalIncome.toLocaleString()}</p>
                                            <p>Total Expenses: {goal.periodDetails.totalExpense.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Start Date: {new Date(goal.StartDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p>Target Date: {new Date(goal.TargetDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {getFilteredGoals().length === 0 && (
                    <div className="text-center py-8 bg-white shadow rounded-lg">
                        <p className="text-gray-500">No goals found in this category</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default SetGoals;