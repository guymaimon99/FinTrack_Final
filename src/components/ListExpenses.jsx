import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ListExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch expense records
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/expense', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch expense records');
        }

        const data = await response.json();
        setExpenses(data);
        
        // Set default date range to first and last expense dates
        if (data.length > 0) {
          const dates = data.map(expense => new Date(expense.TransactionDate));
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

  // Filtered and calculated expenses based on date range
  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return [];

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.TransactionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, startDate, endDate]);

  // Calculate total expense for filtered range
  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.Amount);
      return isNaN(amount) ? sum : sum + amount;
    }, 0);
  }, [filteredExpenses]);

  // Breakdown by categories for filtered range
  const categoryBreakdown = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const categoryName = expense.CategoryName || 'Uncategorized';
      const amount = parseFloat(expense.Amount);
      
      if (!isNaN(amount)) {
        acc[categoryName] = (acc[categoryName] || 0) + amount;
      }
      
      return acc;
    }, {});
  }, [filteredExpenses]);

  // PDF Export Function
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Set document title
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);

    // Add date range information
    doc.setFontSize(10);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 30);

    // Add total expense
    doc.text(`Total Expense: ${totalExpense.toLocaleString()}`, 14, 38);

    // Category Breakdown Table
    const categoryData = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => [
        category, 
        amount.toLocaleString()
      ]);

    doc.text('Category Breakdown', 14, 48);
    doc.autoTable({
      startY: 54,
      head: [['Category', 'Amount']],
      body: categoryData
    });

    // Expense Records Table
    doc.text('Expense Records', 14, doc.previousAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 16,
      head: [['Date', 'Amount', 'Currency', 'Category', 'Payment Method', 'Description', 'Receipt']],
      body: filteredExpenses.map(expense => [
        new Date(expense.TransactionDate).toLocaleDateString(),
        expense.Amount.toLocaleString(),
        expense.Currency,
        expense.CategoryName || 'Uncategorized',
        expense.PaymentMethodName || 'N/A',
        expense.Description || 'No description',
        expense.ReceiptURL ? 'Yes' : 'No'
      ])
    });

    // Save the PDF
    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Loading expense records...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">
          Error: {error}
          <button 
            onClick={handleBackToDashboard} 
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Expense Analysis</h1>
          <div className="flex space-x-4">
            <button 
              onClick={handleExportPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export to PDF
            </button>
            <button 
              onClick={handleBackToDashboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Total Expense */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Total Expenses in Selected Period
            </h2>
            <p className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString()}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Expenses by Category
            </h2>
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between mb-2">
                  <span>{category}</span>
                  <span className="font-bold">{amount.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Expense Records Table */}
        {filteredExpenses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">No expense records found in the selected date range</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Currency</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Payment Method</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.ExpenseID} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {new Date(expense.TransactionDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{expense.Amount.toLocaleString()}</td>
                    <td className="p-4">{expense.Currency}</td>
                    <td className="p-4">{expense.CategoryName || 'Uncategorized'}</td>
                    <td className="p-4">{expense.PaymentMethodName || 'N/A'}</td>
                    <td className="p-4">{expense.Description || 'No description'}</td>
                    <td className="p-4">
                      {expense.ReceiptURL ? (
                        <a 
                          href={expense.ReceiptURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Receipt
                        </a>
                      ) : (
                        'No Receipt'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListExpenses;