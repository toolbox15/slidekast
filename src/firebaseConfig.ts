import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration from your screen
const firebaseConfig = {
  apiKey: "AIzaSyCMQA0SGLYMq2lf0zSr8NQA_JrNDBFSAmk",
  authDomain: "elite-event-network.firebaseapp.com",
  projectId: "elite-event-network",
  storageBucket: "elite-event-network.firebasestorage.app",
  messagingSenderId: "11802539772",
  appId: "1:118072539772:web:0b9451cdf0387cfc3da7f9"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);

// Export the database and storage constants so your templates can use them
export const db = getFirestore(app);
export const storage = getStorage(app);