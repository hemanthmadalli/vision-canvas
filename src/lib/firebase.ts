import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuMF3-8zO-U8pe8KuxZBGW03pSAXBTlYc",
  authDomain: "habit-tracker-40310.firebaseapp.com",
  projectId: "habit-tracker-40310",
  storageBucket: "habit-tracker-40310.firebasestorage.app",
  messagingSenderId: "178683829755",
  appId: "1:178683829755:web:92042881fe16e0c2137f5e",
  measurementId: "G-WWNJVSY8F6",
};

// Initialize Firebase (singleton pattern safe for SSR and client)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
