import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGTbdGRgF4ts0c83eYpELp0ZTlPXd5x4g",
  authDomain: "gold-gaming.firebaseapp.com",
  projectId: "gold-gaming",
  storageBucket: "gold-gaming.firebasestorage.app",
  messagingSenderId: "219502955953",
  appId: "1:219502955953:web:c1c41c36b7a71bab9d0190"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;