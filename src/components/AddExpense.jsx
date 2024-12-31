import React, { useState, useEffect } from 'react';

const AddExpense = () => {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    paymentMethodId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurrenceInterval: '',
    currency: 'USD',
    receiptURL: ''
  });

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/categories?type=EXPENSE', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/payment-methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      setError('Failed to load payment methods');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch('http://localhost:5001/api/expense', {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }

      setSuccess('Expense added successfully! Redirecting...');
      
      // Reset form
      setFormData({
        amount: '',
        categoryId: '',
        paymentMethodId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        isRecurring: false,
        recurrenceInterval: '',
        currency: 'USD',
        receiptURL: ''
      });

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="block pl-2 font-semibold text-xl text-gray-700">
                <h2 className="leading-relaxed">Add New Expense</h2>
              </div>
            </div>

            <form className="divide-y divide-gray-200" onSubmit={handleSubmit}>
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="categoryId">Category</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.CategoryID} value={category.CategoryID}>
                        {category.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="paymentMethodId">Payment Method</label>
                  <select
                    name="paymentMethodId"
                    required
                    value={formData.paymentMethodId}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a payment method</option>
                    {paymentMethods.map(method => (
                      <option key={method.PaymentMethodID} value={method.PaymentMethodID}>
                        {method.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="transactionDate">Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    required
                    value={formData.transactionDate}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="description">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600" htmlFor="receiptURL">Receipt URL (Optional)</label>
                  <input
                    type="text"
                    name="receiptURL"
                    value={formData.receiptURL}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-600">Recurring Expense?</label>
                </div>

                {formData.isRecurring && (
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600" htmlFor="recurrenceInterval">Recurrence Interval</label>
                    <select
                      name="recurrenceInterval"
                      value={formData.recurrenceInterval}
                      onChange={handleChange}
                      className="px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select interval</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm mt-2">{error}</div>
                )}

                {success && (
                  <div className="text-green-600 text-sm mt-2">{success}</div>
                )}

                <div className="pt-4 flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isLoading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;