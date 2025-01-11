import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ListIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/income', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch income records');
        }

        const data = await response.json();
        setIncomes(data);

        if (data.length > 0) {
          const dates = data.map((income) => new Date(income.TransactionDate));
          setStartDate(new Date(Math.min(...dates)).toISOString().split('T')[0]);
          setEndDate(new Date(Math.max(...dates)).toISOString().split('T')[0]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIncomes();
  }, []);

  const filteredIncomes = useMemo(() => {
    if (!startDate || !endDate) return [];
    return incomes.filter((income) => {
      const incomeDate = new Date(income.TransactionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return incomeDate >= start && incomeDate <= end;
    });
  }, [incomes, startDate, endDate]);

  const totalIncome = useMemo(
    () =>
      filteredIncomes.reduce(
        (sum, income) => sum + parseFloat(income.Amount || 0),
        0
      ),
    [filteredIncomes]
  );

  const categoryBreakdown = useMemo(() => {
    return filteredIncomes.reduce((acc, income) => {
      const categoryName = income.CategoryName || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + parseFloat(income.Amount || 0);
      return acc;
    }, {});
  }, [filteredIncomes]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Income Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 30);
    doc.text(`Total Income: ${totalIncome.toLocaleString()}`, 14, 38);

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
      body: filteredIncomes.map((income) => [
        new Date(income.TransactionDate).toLocaleDateString(),
        income.Amount.toLocaleString(),
        income.CategoryName || 'Uncategorized',
        income.Description || 'No description',
      ]),
    });

    doc.save(`Income_Report_${startDate}_to_${endDate}.pdf`);
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
    <div className="income-container">
      <header className="income-header">
        <h1>Income Analysis</h1>
        <div className="header-buttons">
          <button onClick={handleBackToDashboard} className="btn">Back to Dashboard</button>
          <button onClick={handleExportPDF} className="btn">Export PDF</button>
        </div>
      </header>
      <section className="income-stats">
        <div className="card">
          <h2>Total Income</h2>
          <p>{totalIncome.toLocaleString()} ₪</p>
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
      <table className="income-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncomes.map((income) => (
            <tr key={income.IncomeID}>
              <td>{new Date(income.TransactionDate).toLocaleDateString()}</td>
              <td>{income.Amount.toLocaleString()} ₪</td>
              <td>{income.CategoryName || 'Uncategorized'}</td>
              <td>{income.Description || 'No description'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

          .income-container {
            padding: 20px;
            font-family: 'Poppins', sans-serif;
          }
          .income-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            color: white;
            padding: 15px;
            border-radius: 10px;
          }
          .income-header h1 {
            margin: 0;
          }
          .header-buttons {
            display: flex;
            gap: 10px;
          }
          .btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }
          .btn:hover {
            background-color: #2563eb;
            transform: scale(1.05);
          }
          .btn:active {
            transform: scale(0.95);
          }
          .income-stats {
            display: flex;
            margin: 20px 0;
          }
          .card {
            flex: 1;
            background: #f0f9ff;
            margin-right: 10px;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #dbeafe;
          }
          .income-table {
            width: 80%;
            margin: 20px auto;
            border-collapse: collapse;
          }
          .income-table th, .income-table td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .income-table th {
            background-color: #3b82f6;
            color: white;
          }
          .income-table td {
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};

export default ListIncome;
