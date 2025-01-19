import React, { useState, useEffect } from 'react';

const WelcomePage = () => {
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    if (!showText) {
      document.querySelector('.logo-container').classList.add('animate-logo');
    }
  }, [showText]);

  const handleAnimationEnd = () => {
    setShowText(false);
  };

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  return (
    <div className="welcome-container">
      {showText ? (
        <div
          className="text-container fade-in-out"
          onAnimationEnd={handleAnimationEnd}
        >
          <h1 className="welcome-text">WELCOME TO FINTRACK</h1>
        </div>
      ) : (
        <>
          <div className="logo-container">
            <img
              src="/images/whiteLogoNoBG.png"
              alt="FinTrack Logo"
              className="logo"
            />
          </div>
          <div className="caption-container">
            <h2 className="main-caption"> Track Your Money!</h2>
            <div className="features-list">
              <p>✨ Smart Financial Planning</p>
              <p>💰 Track Income & Expenses</p>
              <p>🎯 Set & Achieve Goals</p>
            </div>
          </div>
          <button onClick={handleGetStarted} className="btn-get-started">
            Get Started
          </button>
        </>
      )}
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  @keyframes logoBounce {
    0% {
      transform: scale(0) translateY(50px);
      opacity: 0;
    }
    50% {
      transform: scale(1.5) translateY(-20px);
      opacity: 1;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .welcome-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    text-align: center;
    position: relative;
    overflow: hidden;
    padding: 20px;
  }

  .text-container {
    position: relative;
    z-index: 1;
  }

  .fade-in-out .welcome-text {
    animation: fadeIn 1.5s ease-in-out, fadeOut 1s ease-in-out 2s forwards;
    font-size: 6rem; 
    color: #ffffff; 
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); 
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    visibility: hidden;
    margin-bottom: 2rem;
  }

  .logo-container.animate-logo {
    visibility: visible;
    animation: logoBounce 1.5s ease-out;
  }

  .logo {
    width: 300px; 
    height: auto;
  }

  .caption-container {
    margin: 2rem 0 4rem 0;
    animation: slideUp 1s ease-out 0.5s both;
  }

  .main-caption {
    color: #ffffff;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .features-list p {
    color: #ffffff;
    font-size: 1.25rem;
    opacity: 0.9;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .btn-get-started {
    background-color: white;
    color: #1e40af;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
  }

  .btn-get-started:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background-color: #f8fafc;
  }

  .btn-get-started:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .fade-in-out .welcome-text {
      font-size: 3rem;
    }

    .main-caption {
      font-size: 2rem;
    }

    .features-list p {
      font-size: 1.1rem;
    }

    .logo {
      width: 200px;
    }

    .btn-get-started {
      font-size: 1.25rem;
      padding: 0.875rem 2rem;
    }
  }
`;

export default WelcomePage;