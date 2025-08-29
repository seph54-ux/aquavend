import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/AquaGo.png';
import '../App.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <img src={logo} alt="Aquavend Logo" className="welcome-logo" />
        <h1 className="welcome-title">Welcome to AquaGo</h1>
        <p className="welcome-tagline">Your smart water vending solution.</p>
        <div className="welcome-buttons">
          <Link to="/login" className="welcome-button primary">
            Login
          </Link>
          <Link to="/signup" className="welcome-button secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;