import React, { useState } from 'react';
import Confetti from 'react-confetti';

const SetGoals = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
        description: '',
        priority: '0',
    });

    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch('http://localhost:5001/api/savings-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({...formData, userId})
            });

            if (!response.ok) {
                throw new Error('Failed to save goal');
            }

            setFormData({
                name: '',
                targetAmount: '',
                startDate: new Date().toISOString().split('T')[0],
                targetDate: '',
                description: '',
                priority: '0',
            });
            setSuccess(true);
            setStep(1);
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="content">
                        <h2>What is your goal?</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Goal Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <button onClick={() => setStep(2)}>Next</button>
                    </div>
                );
            case 2:
                return (
                    <div className="content">
                        <h2>Set your target amount</h2>
                        <input
                            type="number"
                            name="targetAmount"
                            placeholder="Target Amount"
                            value={formData.targetAmount}
                            onChange={handleChange}
                        />
                        <button onClick={() => setStep(1)}>Back</button>
                        <button onClick={() => setStep(3)}>Next</button>
                    </div>
                );
            case 3:
                return (
                    <div className="content">
                        <h2>Pick a date</h2>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                        <input
                            type="date"
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleChange}
                        />
                        <button onClick={() => setStep(2)}>Back</button>
                        <button onClick={() => setStep(4)}>Next</button>
                    </div>
                );
            case 4:
                return (
                    <div className="content">
                        <h2>Describe your goal</h2>
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <button onClick={() => setStep(3)}>Back</button>
                        <button onClick={handleSubmit}>Finish</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="set-goals">
            <img src="/images/whiteLogoNoBG.png" alt="Logo" />
            {success && <Confetti />}
            <div className="step">{renderStepContent()}</div>
            <div className="text-center">
                <button 
                    className="back-button" 
                    onClick={() => (window.location.href = '/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>
            <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

                .set-goals {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Roboto', sans-serif;
                    padding: 20px;
                    position: relative;
                }

                .set-goals img {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 80px;
                    height: auto;
                }

                .text-center {
                    text-align: center;
                    margin-top: 2rem;
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

                .step {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    width: 100%;
                    height: 400px;
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
                    margin-bottom: 10px;
                }

                input,
                textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 1rem;
                    box-sizing: border-box;
                }

                button {
                    padding: 10px 20px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                button:hover {
                    background: #1e40af;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}
            </style>
        </div>
    );
};

export default SetGoals;