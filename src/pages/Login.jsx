import React, { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Dialog } from '@capacitor/dialog';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const user = result.user;
          if (!user) throw new Error('No user data received from Google');

          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          const userData = {
            fullName: user.displayName || 'No Name',
            email: user.email,
            photoURL: user.photoURL || '',
            provider: 'google',
            createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };

          await setDoc(userDocRef, userData, { merge: true });

          await Dialog.alert({
            title: "Success",
            message: "Google sign-in successful!",
            buttonTitle: "OK",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Google Sign-in Redirect Error:", error);
        await Dialog.alert({
            title: "Sign-in Error",
            message: `Failed to sign in with Google: ${error.message}`,
            buttonTitle: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [auth, navigate]);


  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await Dialog.alert({
        title: "Login Successful",
        message: "Redirecting to dashboard...",
        buttonTitle: "OK",
      });
      navigate("/dashboard");
    } catch (err) {
      await Dialog.alert({
        title: "Login Failed",
        message: err.code === "auth/user-not-found" || err.code === "auth/wrong-password" 
          ? "Invalid email or password."
          : "Login failed: " + err.message,
        buttonTitle: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signOut(auth).catch(() => {});
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      await Dialog.alert({
        title: "Sign-in Error",
        message: `Failed to start sign in with Google: ${error.message}`,
        buttonTitle: "OK",
      });
    }
  };

  if (loading) {
    return <div className="auth-container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">Welcome Back!</h2>
      <h3 className="auth-subtitle">Let's monitor our machines</h3>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button className="btn-primary" type="submit" disabled={loading}>Log In</button>
      </form>
      <div className="divider">or</div>
      <button onClick={handleGoogleSignIn} className="btn-google" disabled={loading}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google Logo"
          className="google-icon"
        />
        Continue with Google
      </button>
      <h6 className="auth-footer">
        Don't have an account?{" "}
        <span
          className="auth-link"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </h6>
    </div>
  );
}

export default Login;