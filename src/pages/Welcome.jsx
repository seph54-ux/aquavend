import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/AquaGo.png'; // Import the logo

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <img src={logo} alt="AquaGo Logo" className="mx-auto h-40 w-auto" /> 
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
          Welcome to AquaGo
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Your smart water vending solution.
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/login"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
