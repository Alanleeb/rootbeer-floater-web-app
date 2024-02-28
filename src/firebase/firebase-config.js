// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2m0Cv1VL-ooiUaiBUJBhr3AZeSBjdX5U",
  authDomain: "raffleball-fec70.firebaseapp.com",
  databaseURL: "https://raffleball-fec70-default-rtdb.firebaseio.com",
  projectId: "raffleball-fec70",
  storageBucket: "raffleball-fec70.appspot.com",
  messagingSenderId: "343509768953",
  appId: "1:343509768953:web:12e0a0dfc4e2ab9337a028",
  measurementId: "G-4SLV6C06M1",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const FIREBASE_DB = getFirestore(app);
export const db = getDatabase(app);
