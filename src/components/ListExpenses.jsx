import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ListExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchExpenses();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [refreshTrigger]);

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
    doc.text(`Total Expenses: ₪${totalExpense.toLocaleString()}`, 14, 38);

    const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => [
      category,
      `₪${amount.toLocaleString()}`,
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
        `₪${expense.Amount.toLocaleString()}`,
        expense.CategoryName || 'Uncategorized',
        expense.Description || 'No description',
      ]),
    });

    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="expense-container">
      <header className="expense-header">
        <h1>Expense Analysis</h1>
        <div className="header-buttons">
          <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="btn refresh-btn">
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
          <button onClick={handleExportPDF} className="btn">Export PDF</button>
          <button onClick={handleBackToDashboard} className="btn">Back to Dashboard</button>
        </div>
      </header>

      {/* Date Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {loading && <div className="loading-overlay">Loading expenses...</div>}

      {error && <div className="error-message">Error: {error}</div>}

      <section className="expense-stats">
        <div className="card total-card">
          <h2>Total Expenses</h2>
          <p className="total-amount">₪{totalExpense.toLocaleString()}</p>
        </div>
        <div className="card breakdown-card">
          <h2>Category Breakdown</h2>
          <ul className="category-list">
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <li key={category} className="category-item">
                <span className="category-name">{category}</span>
                <span className="category-amount">₪{amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="table-container">
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
                <td>₪{expense.Amount.toLocaleString()}</td>
                <td>{expense.CategoryName || 'Uncategorized'}</td>
                <td>{expense.Description || 'No description'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .expense-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Poppins', sans-serif;
        }

        .expense-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .btn {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .refresh-btn {
          background-color: #34d399;
        }

        .date-filter {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-input {
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          outline: none;
          transition: all 0.3s ease;
        }

        .date-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .expense-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .total-card {
          text-align: center;
        }

        .total-amount {
          font-size: 2rem;
          font-weight: 600;
          color: #3b82f6;
        }

        .category-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .category-item:last-child {
          border-bottom: none;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .expense-table {
          width: 100%;
          border-collapse: collapse;
        }

        .expense-table th,
        .expense-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        .expense-table th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #1f2937;
        }

        .expense-table tr:hover {
          background-color: #f8fafc;
        }

        .loading-overlay {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .error-message {
          background-color: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .expense-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }

          .date-filter {
            flex-direction: column;
          }

          .expense-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ListExpenses;