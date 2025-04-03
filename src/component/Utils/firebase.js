// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUdDNk3O4Ty00A2b9a6Vp7EZvCs-CeD0o",
  authDomain: "social-nest-bc98d.firebaseapp.com",
  projectId: "social-nest-bc98d",
  storageBucket: "social-nest-bc98d.firebasestorage.app",
  messagingSenderId: "733695795719",
  appId: "1:733695795719:web:86cca2adf334fd03e340a2",
  measurementId: "G-XR2ZFK7B00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth=getAuth();
export const db=getFirestore(app)
export const storage=getStorage(app);