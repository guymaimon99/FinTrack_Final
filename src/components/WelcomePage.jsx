import React, { useState, useEffect } from 'react';

const WelcomePage = () => {
  const [showText, setShowText] = useState(true); // אם להציג טקסט או לוגו

  useEffect(() => {
    if (!showText) {
      // אם הטקסט אינו מוצג, מפעילים את אנימציית החזיר מייד
      document.querySelector('.logo-container').classList.add('animate-logo');
    }
  }, [showText]);

  const handleAnimationEnd = () => {
    setShowText(false); // מסיים אנימציה ומחליף לחזיר
  };

  const handleGetStarted = () => {
    window.location.href = '/login'; // מוביל לדף הלוגין
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
        <div className="logo-container">
          <img
            src="/images/whiteLogoNoBG.png" // מסלול לתמונה החדשה
            alt="FinTrack Logo"
            className="logo"
          />
        </div>
      )}
      <button onClick={handleGetStarted} className="btn-get-started">
        Get Started
      </button>
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
      visibility: hidden; /* מסתיר את האלמנט לאחר היעלמות */
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
  }

  .logo-container.animate-logo {
    visibility: visible;
    animation: logoBounce 1.5s ease-out;
  }

  .logo {
    width: 300px; 
    height: auto;
  }

  .btn-get-started {
    position: absolute;
    bottom: 30px;
    background-color: #3b82f6; 
    color: #ffffff; 
    border: none;
    padding: 12px 24px;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  .btn-get-started:hover {
    background-color: #3b82f6;
    transform: scale(1.05);
  }

  .btn-get-started:active {
    background-color: #2563eb;
    transform: scale(0.95);
  }
`;

export default WelcomePage;
