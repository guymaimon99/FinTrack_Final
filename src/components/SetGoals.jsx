import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

// Google Calendar API constants
const CLIENT_ID = <process className="env REACT_APP_GOOGLE_CLIENT_ID"></process>;
const API_KEY = <process className="env REACT_APP_GOOGLE_API_KEY"></process>;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

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
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Load Google API client
    useEffect(() => {
        // Only load if the gapi variable exists
        if (window.gapi) {
            const loadGapi = () => {
                window.gapi.load('client:auth2', initClient);
            };

            const initClient = () => {
                window.gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                }).then(() => {
                    setGapiLoaded(true);
                    // Check if already signed in
                    if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        setIsAuthorized(true);
                    }
                    
                    // Listen for sign-in state changes
                    window.gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
                        setIsAuthorized(isSignedIn);
                    });
                }).catch(error => {
                    console.error("Error initializing Google API client:", error);
                });
            };

            loadGapi();
        } else {
            console.error("Google API client not available");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAuth = async () => {
        // If already authorized, return true
        if (isAuthorized) return true;
        
        // If API not loaded, return false
        if (!gapiLoaded) {
            console.error("Google API client not loaded yet");
            return false;
        }

        try {
            await window.gapi.auth2.getAuthInstance().signIn();
            return true;
        } catch (error) {
            console.error("Google Auth Error:", error);
            return false;
        }
    };

    const createCalendarEvents = async () => {
        if (!gapiLoaded) {
            console.error("Google API client not loaded yet");
            return;
        }

        try {
            const startDate = new Date(formData.startDate);
            const targetDate = new Date(formData.targetDate);
            const events = [];

            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
                console.error("Invalid date format");
                return;
            }

            // Create a copy of the start date to avoid modifying during iterations
            const currentDate = new Date(startDate);
            
            // Add events for each day between start and target date
            while (currentDate <= targetDate) {
                // Create new Date objects for start/end to avoid reference issues
                const eventStartTime = new Date(currentDate);
                eventStartTime.setHours(8, 0, 0, 0);
                
                const eventEndTime = new Date(currentDate);
                eventEndTime.setHours(9, 0, 0, 0);
                
                const event = {
                    summary: `Goal Reminder: ${formData.name}`,
                    description: formData.description,
                    start: {
                        dateTime: eventStartTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
                    },
                    end: {
                        dateTime: eventEndTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
                    },
                };

                try {
                    const response = await window.gapi.client.calendar.events.insert({
                        calendarId: "primary",
                        resource: event,
                    });
                    console.log("Event created:", response);
                    events.push(response);
                } catch (error) {
                    console.error("Error creating event:", error);
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return events.length > 0;
        } catch (error) {
            console.error("Error creating calendar events:", error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Validate form data
            if (!formData.name || !formData.targetAmount || !formData.targetDate) {
                alert('Please fill in all required fields');
                return;
            }

            // Submit goal to API
            const response = await fetch('http://localhost:5001/api/savings-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({...formData, userId})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save goal');
            }

            // Add Google Calendar events if API available
            if (window.gapi) {
                const authSuccess = await handleAuth();
                if (authSuccess) {
                    const eventsCreated = await createCalendarEvents();
                    if (eventsCreated) {
                        alert("Goal reminders added to Google Calendar!");
                    }
                }
            }

            // Reset form and show success
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
            alert(`Error: ${error.message || 'Failed to save goal'}`);
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
                            required
                        />
                        <button 
                            onClick={() => setStep(2)}
                            disabled={!formData.name}
                        >
                            Next
                        </button>
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
                            min="1"
                            required
                        />
                        <div className="button-group">
                            <button onClick={() => setStep(1)}>Back</button>
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!formData.targetAmount || parseFloat(formData.targetAmount) <= 0}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="content">
                        <h2>Pick a date</h2>
                        <div className="date-inputs">
                            <div className="date-field">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="date-field">
                                <label htmlFor="targetDate">Target Date</label>
                                <input
                                    id="targetDate"
                                    type="date"
                                    name="targetDate"
                                    value={formData.targetDate}
                                    onChange={handleChange}
                                    min={formData.startDate}
                                    required
                                />
                            </div>
                        </div>
                        <div className="button-group">
                            <button onClick={() => setStep(2)}>Back</button>
                            <button 
                                onClick={() => setStep(4)}
                                disabled={!formData.targetDate}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="content">
                        <h2>Describe your goal</h2>
                        <textarea
                            name="description"
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                        <div className="button-group">
                            <button onClick={() => setStep(3)}>Back</button>
                            <button onClick={handleSubmit}>Finish</button>
                        </div>
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

                .button-group {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                }

                .date-inputs {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 100%;
                }

                .date-field {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                }

                .date-field label {
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #4b5563;
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

                button:hover:not(:disabled) {
                    background: #1e40af;
                }

                button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
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
