import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ListExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/expense', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch expense records');
        }

        const data = await response.json();
        setExpenses(data);

        if (data.length > 0) {
          const dates = data.map((expense) => new Date(expense.TransactionDate));
          setStartDate(new Date(Math.min(...dates)).toISOString().split('T')[0]);
          setEndDate(new Date(Math.max(...dates)).toISOString().split('T')[0]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return [];
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.TransactionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, startDate, endDate]);

  const totalExpense = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum, expense) => sum + parseFloat(expense.Amount || 0),
        0
      ),
    [filteredExpenses]
  );

  const categoryBreakdown = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const categoryName = expense.CategoryName || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + parseFloat(expense.Amount || 0);
      return acc;
    }, {});
  }, [filteredExpenses]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 30);
    doc.text(`Total Expenses: ${totalExpense.toLocaleString()}`, 14, 38);

    const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => [
      category,
      amount.toLocaleString(),
    ]);

    doc.text('Category Breakdown', 14, 48);
    doc.autoTable({
      startY: 54,
      head: [['Category', 'Amount']],
      body: categoryData,
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Date', 'Amount', 'Category', 'Description']],
      body: filteredExpenses.map((expense) => [
        new Date(expense.TransactionDate).toLocaleDateString(),
        expense.Amount.toLocaleString(),
        expense.CategoryName || 'Uncategorized',
        expense.Description || 'No description',
      ]),
    });

    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="expense-container">
      <header className="expense-header">
        <h1>Expense Analysis</h1>
        <div className="header-buttons">
          <button onClick={handleBackToDashboard} className="btn">Back to Dashboard</button>
          <button onClick={handleExportPDF} className="btn">Export PDF</button>
        </div>
      </header>
      <section className="expense-stats">
        <div className="card">
          <h2>Total Expenses</h2>
          <p>{totalExpense.toLocaleString()} ₪</p>
        </div>
        <div className="card">
          <h2>Category Breakdown</h2>
          <ul>
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <li key={category}>
                {category}: {amount.toLocaleString()} ₪
              </li>
            ))}
          </ul>
        </div>
      </section>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((expense) => (
            <tr key={expense.ExpenseID}>
              <td>{new Date(expense.TransactionDate).toLocaleDateString()}</td>
              <td>{expense.Amount.toLocaleString()} ₪</td>
              <td>{expense.CategoryName || 'Uncategorized'}</td>
              <td>{expense.Description || 'No description'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

          .expense-container {
            padding: 20px;
            font-family: 'Poppins', sans-serif;
          }
          .expense-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(90deg, #ef4444, #f87171);
            color: white;
            padding: 15px;
            border-radius: 10px;
          }
          .expense-header h1 {
            margin: 0;
          }
          .header-buttons {
            display: flex;
            gap: 10px;
          }
          .btn {
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }
          .btn:hover {
            background-color: #dc2626;
            transform: scale(1.05);
          }
          .btn:active {
            transform: scale(0.95);
          }
          .expense-stats {
            display: flex;
            margin: 20px 0;
          }
          .card {
            flex: 1;
            background: #fef2f2;
            margin-right: 10px;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #fecaca;
          }
          .expense-table {
            width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
          }
          .expense-table th, .expense-table td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .expense-table th {
            background-color: #ef4444;
            color: white;
          }
          .expense-table td {
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};

export default ListExpenses;
