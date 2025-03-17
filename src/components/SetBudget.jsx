import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const SetBudget = () => {
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        currency: 'ILS',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        rolloverUnused: false,
        alertThreshold: '80', // Default alert at 80% of budget
    });

    const [success, setSuccess] = useState(false);

    useEffect(() => {
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch('https://fintrack-final-2-0xum.onrender.com/api/budgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userId,
                    amount: parseFloat(formData.amount),
                    alertThreshold: parseFloat(formData.alertThreshold)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save budget');
            }

            setFormData({
                categoryId: '',
                amount: '',
                currency: 'ILS',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                rolloverUnused: false,
                alertThreshold: '80',
            });
            setSuccess(true);
            setStep(1);
            setTimeout(() => setSuccess(false), 5000);
            setTimeout(() => {
                window.location.href = '/view-budget';
            }, 2000);
        } catch (error) {
            console.error('Error saving budget:', error);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="content">
                        <h2>Select Budget Category</h2>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category.CategoryID} value={category.CategoryID}>
                                    {category.Name}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => setStep(2)} disabled={!formData.categoryId}>Next</button>
                    </div>
                );
            case 2:
                return (
                    <div className="content">
                        <h2>Set Budget Amount</h2>
                        <input
                            type="number"
                            name="amount"
                            placeholder="Budget Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                        <div className="threshold-container">
                            <label>Alert me when I reach:</label>
                            <select
                                name="alertThreshold"
                                value={formData.alertThreshold}
                                onChange={handleChange}
                            >
                                <option value="50">50% of budget</option>
                                <option value="80">80% of budget</option>
                                <option value="90">90% of budget</option>
                            </select>
                        </div>
                        <button onClick={() => setStep(1)}>Back</button>
                        <button onClick={() => setStep(3)} disabled={!formData.amount}>Next</button>
                    </div>
                );
            case 3:
                return (
                    <div className="content">
                        <h2>Set Budget Period</h2>
                        <div className="date-inputs">
                            <div>
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    min={formData.startDate}
                                    required
                                />
                            </div>
                        </div>
                        <div className="checkbox-container">
                            <label>
                                <input
                                    type="checkbox"
                                    name="rolloverUnused"
                                    checked={formData.rolloverUnused}
                                    onChange={handleChange}
                                />
                                Roll over unused budget to next period
                            </label>
                        </div>
                        <button onClick={() => setStep(2)}>Back</button>
                        <button onClick={handleSubmit} disabled={!formData.endDate}>Create Budget</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="set-budget">
            {success && <Confetti />}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

                    .set-budget {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #3b82f6, #1e40af);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Roboto', sans-serif;
                        padding: 20px;
                        position: relative;
                    }

                    .back-button {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        background: #1e40af;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        padding: 10px 15px;
                        transition: background-color 0.3s;
                    }

                    .back-button:hover {
                        background: #1d4ed8;
                    }

                    .step {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        max-width: 400px;
                        width: 100%;
                        min-height: 400px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        padding: 20px;
                        box-sizing: border-box;
                        animation: fadeIn 0.5s ease-in-out;
                    }

                    .content {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        width: 100%;
                    }

                    .step h2 {
                        color: #1e40af;
                        margin-bottom: 20px;
                        font-size: 1.5rem;
                    }

                    input, select, textarea {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        font-size: 1rem;
                        box-sizing: border-box;
                        transition: all 0.3s ease;
                    }

                    input:focus, select:focus, textarea:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }

                    .date-inputs {
                        display: grid;
                        gap: 15px;
                    }

                    .date-inputs label {
                        display: block;
                        text-align: left;
                        margin-bottom: 5px;
                        color: #4b5563;
                    }

                    .checkbox-container {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .checkbox-container input[type="checkbox"] {
                        width: auto;
                        margin-right: 8px;
                    }

                    .threshold-container {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        align-items: start;
                    }

                    button {
                        padding: 12px 24px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    button:hover:not(:disabled) {
                        background: #2563eb;
                        transform: translateY(-1px);
                    }

                    button:disabled {
                        background: #9ca3af;
                        cursor: not-allowed;
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
            <button className="back-button" onClick={() => (window.location.href = '/dashboard')}>
                Back to Dashboard
            </button>
            <div className="step">{renderStepContent()}</div>
        </div>
    );
};

export default SetBudget;