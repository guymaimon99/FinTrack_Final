import React, { useState, useEffect } from 'react';


const AddIncome = () => {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurrenceInterval: '',
    currency: 'USD',
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
      const response = await fetch('http://localhost:5001/api/categories?type=INCOME', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/payment-methods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load payment methods' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch('http://localhost:5001/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: userId,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add income');
      }

      // Clear form and show success message
      setFormData({
        amount: '',
        categoryId: '',
        paymentMethodId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        isRecurring: false,
        recurrenceInterval: '',
        currency: 'USD',
      });
      
      setMessage({ type: 'success', text: 'Income added successfully!' });
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      console.error('Error adding income:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to add income' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="add-income-container">
      <div className="form-card">
        <h1 className="form-title">Add Income</h1>
        
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
              {categories.map((category) => (
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
              {paymentMethods.map((method) => (
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

          <div className="button-group">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Income'}
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

      <style>{`
        .add-income-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #dceafe, #bfdbfe);
          font-family: 'Poppins', sans-serif;
          padding: 20px;
        }

        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/images/logonew.png');
          background-repeat: repeat;
          background-size: 150px;
          background-position: center;
          opacity: 0.05;
          pointer-events: none;
        }

        .form-card {
          background: white;
          border-radius: 15px;
          padding: 40px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .form-title {
          font-size: 1.8rem;
          color: #1d4ed8;
          margin-bottom: 30px;
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
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0px 0px 0px 3px rgba(37, 99, 235, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .button-group {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 10px;
        }

        .submit-button {
          flex: 1;
          background: #2563eb;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-button:not(:disabled):hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .submit-button.alt-button {
          background: #e2e8f0;
          color: #475569;
        }

        .submit-button.alt-button:not(:disabled):hover {
          background: #cbd5e1;
        }

        @media (max-width: 640px) {
          .form-card {
            padding: 25px;
          }

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AddIncome;