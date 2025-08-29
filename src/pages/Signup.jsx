import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Dialog } from '@capacitor/dialog';
import '../App.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      await Dialog.alert({
        title: 'Password Error',
        message: 'Passwords do not match.',
        buttonTitle: 'OK',
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        fullName: formData.fullName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        provider: 'email',
      });

      await Dialog.alert({
        title: 'Signup Successful',
        message: 'You can now log in.',
        buttonTitle: 'OK',
      });
      navigate("/dashboard");
    } catch (err) {
      await Dialog.alert({
        title: 'Signup Failed',
        message: err.message,
        buttonTitle: 'Try Again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Welcome!</h1>
      <h2 className="auth-subtitle">Let's Sign Up</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <h6 className="auth-footer">
        Already have an account?{" "}
        <span
          className="auth-link"
          onClick={() => navigate("/login")}
        >
          Log In
        </span>
      </h6>
    </div>
  );
}

export default Signup;
