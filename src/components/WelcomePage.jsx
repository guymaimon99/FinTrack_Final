import React, { useState } from 'react';

const WelcomePage = () => {
  const [showAnimation, setShowAnimation] = useState(true);

  const handleAnimationEnd = () => {
    setTimeout(() => setShowAnimation(false), 3000);
  };

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  return (
    <div className="welcome-container" onAnimationEnd={handleAnimationEnd}>
      {showAnimation && <div className="animation-overlay"></div>}
      <div className="logo-container">
        <img
          src="/images/logonew.png" // החלף את הנתיב לפי מיקום הלוגו שלך
          alt="FinTrack Logo"
          className="logo"
        />
      </div>
      <div className="text-container">
        <h1 className="welcome-text">WELCOME TO FINTRACK</h1>
        <button onClick={handleGetStarted} className="btn-get-started">
          Get Started
        </button>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

  .welcome-container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #d0ebff, #90caf9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .animation-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    z-index: 1000;
    animation: fadeOut 3s forwards;
  }

  .logo-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: bounce 2s infinite;
    z-index: 0;
  }

  .logo {
    width: 80vw; /* הלוגו ימלא 80% מרוחב המסך */
    max-width: 700px; /* גודל מקסימלי */
    height: auto;
    opacity: 0.2; /* הלוגו שקוף קלות כדי לא להסתיר את הטקסט */
  }

  @keyframes bounce {
    0%, 100% {
      transform: translate(-50%, -50%);
    }
    50% {
      transform: translate(-50%, calc(-50% - 20px));
    }
  }

  .text-container {
    position: relative;
    z-index: 1; /* הטקסט יופיע מעל הלוגו */
  }

  .welcome-text {
    font-size: 4rem; /* גודל כתב מוגדל */
    color: #1e3a8a;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 20px;
    text-transform: uppercase; /* טקסט באותיות גדולות */
  }

  .btn-get-started {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1.5rem; /* גודל כפתור מוגדל */
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .btn-get-started:hover {
    background-color: #1d4ed8;
    transform: scale(1.05);
  }

  .btn-get-started:active {
    transform: scale(0.95);
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

export default WelcomePage;
