// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOr40ft9OBrYZFHAbT3EUZanYIkcitjqw",
  authDomain: "studypilot-ai-eec22.firebaseapp.com",
  projectId: "studypilot-ai-eec22",
  storageBucket: "studypilot-ai-eec22.firebasestorage.app",
  messagingSenderId: "158479190185",
  appId: "1:158479190185:web:7a17e7dfdfc105a81c01b8",
  measurementId: "G-5CLKNJY3C2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;