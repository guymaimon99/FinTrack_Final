import React, { useState } from "react";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    paymentMethodId: "",
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
    recurrenceInterval: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Expense added:", formData);
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="add-expense-container">
      <div className="form-card">
        <h1 className="form-title">Add Expense</h1>
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
              <option value="1">Groceries</option>
              <option value="2">Utilities</option>
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
              <option value="1">Credit Card</option>
              <option value="2">Cash</option>
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
            <button type="submit" className="submit-button">
              Add Expense
            </button>
            <button
              type="button"
              className="submit-button alt-button"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
      <div className="background-overlay"></div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

          .add-expense-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #dceafe, #bfdbfe);
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
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
          }
          .form-title {
            font-size: 1.8rem;
            color: #1d4ed8;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
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
            box-shadow: 0px 0px 8px rgba(37, 99, 235, 0.5);
          }
          .form-textarea {
            resize: none;
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
