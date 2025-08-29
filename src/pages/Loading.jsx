import React from "react";
import "../App.css";
import logo from "../assets/AquaGo.png";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="logo-wrapper">
        <img src={logo} alt="Aquavend Logo" className="logo" />
        <h1 className="loading-title">AquaVend</h1>
      </div>
    </div>
  );
};

export default LoadingScreen;
