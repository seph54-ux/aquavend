import React from "react";
import "../App.css"; // using the styles we already have

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="logo-wrapper">
        {/* Replace src with your actual logo path */}
        <img src="./src/assets/AquaGo.png" alt="Aquavend Logo" className="logo" />
        <h1 className="loading-title">AquaVend</h1>
      </div>
    </div>
  );
};

export default LoadingScreen;
