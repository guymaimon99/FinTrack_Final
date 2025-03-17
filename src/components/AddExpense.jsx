import React, { useState, useEffect } from "react";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    paymentMethodId: "",
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
    recurrenceInterval: "",
    //currency: "ILS" check if need
  });

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
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
      setMessage({ type: 'error', text: 'Failed to load categories' });
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://fintrack-final-2-0xum.onrender.com/api/payment-methods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load payment methods' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch('https://fintrack-final-2-0xum.onrender.com/api/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userId: parseInt(userId),
          amount: parseFloat(formData.amount),
          categoryId: parseInt(formData.categoryId),
          paymentMethodId: parseInt(formData.paymentMethodId)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add expense');
      }

      // Clear form and show success message
      setFormData({
        amount: "",
        categoryId: "",
        paymentMethodId: "",
        transactionDate: new Date().toISOString().split("T")[0],
        description: "",
        isRecurring: false,
        recurrenceInterval: "",
        //currency: "ILS"
      });
      
      setMessage({ type: 'success', text: 'Expense added successfully!' });
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      console.error('Error adding expense:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to add expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="add-expense-container">
      <div className="form-card">
        <h1 className="form-title">Add Expense</h1>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              className="form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.CategoryID} value={category.CategoryID}>
                  {category.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethodId"
              value={formData.paymentMethodId}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select payment method</option>
              {paymentMethods.map(method => (
                <option key={method.PaymentMethodID} value={method.PaymentMethodID}>
                  {method.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Date</label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details"
              className="form-input form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Recurring Expense</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-group">
              <label>Recurrence Interval</label>
              <select
                name="recurrenceInterval"
                value={formData.recurrenceInterval}
                onChange={handleChange}
                className="form-input"
                required={formData.isRecurring}
              >
                <option value="">Select interval</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          )}

          <div className="button-group">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
            <button
              type="button"
              className="submit-button alt-button"
              onClick={handleBackToDashboard}
              disabled={isSubmitting}
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
      <div className="background-overlay"></div>
      
      <style>
        {`
          .add-expense-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
          }

          .add-expense-container::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            width: 300px;
            height: 200px;
            background: url('/images/whiteFullLogoNoBG.png') no-repeat;
            background-size: contain;
            z-index: 3;
          }

          .background-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-repeat: repeat;
            background-size: 150px;
            background-position: center;
            opacity: 0.05;
          }

          .form-card {
            background: white;
            border-radius: 15px;
            padding: 40px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 2;
            margin: 0 20px;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            color: #333;
          }

          .form-title {
            font-size: 1.8rem;
            color: #1d4ed8;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
          }

          .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 0.9rem;
          }

          .message.success {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }

          .message.error {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
          }

          .form-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group label {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
            font-size: 14px;
          }

          .form-input {
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
            color: #1e293b;
          }

          .form-input:focus {
            border-color: #2563eb;
            box-shadow: 0px 0px 8px rgba(37, 99, 235, 0.5);
          }

          .form-textarea {
            resize: none;
          }

          .form-checkbox {
            margin-right: 10px;
          }

          .button-group {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .submit-button {
            flex: 1;
            background: #2563eb;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .submit-button:hover {
            background: #1d4ed8;
          }

          .submit-button.alt-button {
            background: #d1d5db;
            color: #1f2937;
          }

          .submit-button.alt-button:hover {
            background: #9ca3af;
          }
        `}
      </style>
    </div>
  );
};

export default AddExpense;