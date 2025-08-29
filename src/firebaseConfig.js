// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBjX5EbJuB-XUm3-XDrinaJFXzhfgN_41s",
    authDomain: "aquavend-e3d60.firebaseapp.com",
    projectId: "aquavend-e3d60",
    storageBucket: "aquavend-e3d60.appspot.com",
    messagingSenderId: "434162045767",
    appId: "1:434162045767:web:36e411a8078d6843bdb262",
    measurementId: "G-862289J4NE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Cloud Firestore
const googleProvider = new GoogleAuthProvider(); // Create a single instance

export { auth, db, googleProvider }; // Export all three for use in other files
