import React from "react";
import { useNavigate } from "react-router-dom";


const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Logo placeholder */}
        <img
          src="./src/assets/AquaGo.png"
          alt="AquaVend Logo"
          className="welcome-logo"
        />

        {/* Title */}
        <h1 className="welcome-title">AquaVend</h1>

        {/* Tagline */}
        <h2 className="welcome-tagline">
          Automated. Connected. Efficient.
        </h2>

        {/* Short description */}
        <p className="welcome-description">
          With intelligent automation powered by IoT, this system ensures clean, 
          efficient, and user-friendly water dispensing at all times.
        </p>

        {/* Buttons */}
        <div className="welcome-bottom">
        <button
          className="btn-primary"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
