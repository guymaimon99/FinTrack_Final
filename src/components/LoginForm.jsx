import React, { useState } from 'react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://fintrack-final-2-0xum.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="form-header">
          <div className="logo-container">
            <div className="logo">
              <img src="/images/whiteLogoNoBG.png" alt="Logo" />
          </div>
          </div>
          <h1>Welcome Back!</h1>
          <p>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <a href="/ForgotPassword" className="forgot-link">
                Forgot Password?
              </a>
            </div>
            <div className="input-container">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="register-prompt">
            <p>Don't have an account?</p>
            <a href="/register" className="register-link">
              Create Account
            </a>
          </div>
        </form>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          padding: 20px;
        }

        .login-form-wrapper {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 420px;
          margin: 0 auto; /* מרכז את הטופס */
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          margin-bottom: 1.5rem;
        }

        .logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
          position: relative;
        }

        .logo img {
          position: absolute;
          width: 100%; /* גודל מותאם ללוגו */
          height: 100%;
          object-fit: contain;
        }

        .form-header h1 {
          color: #1e293b;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #64748b;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: center;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .password-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        label {
          color: #1e293b;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-container {
          position: relative;
          width: 100%;
        }

        input {
          width: calc(100% - 2rem);
          margin: 0 auto;
          display: block;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #1e293b;
          transition: all 0.3s ease;
        }

        input::placeholder {
          color: #94a3b8;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .forgot-link {
          color: #3b82f6;
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          text-align: center;
        }

        .login-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          padding: 0.875rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 48px;
        }

        .login-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .register-prompt {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .register-prompt p {
          color: #64748b;
          font-size: 0.95rem;
        }

        .register-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .register-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-form-wrapper {
            padding: 1.5rem;
          }

          .form-header h1 {
            font-size: 1.5rem;
          }

          .logo {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          input {
            padding: 0.625rem 0.875rem;
          }

          .login-button {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
