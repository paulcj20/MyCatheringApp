import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyADJLvPkaZDdDEeM_ZnxX3ykJ_L2QxDs6w",
    authDomain: "mycatheringapp.firebaseapp.com",
    projectId: "mycatheringapp",
    storageBucket: "mycatheringapp.firebasestorage.app",
    messagingSenderId: "6741326094",
    appId: "1:6741326094:web:fdf3cef6939d1e27203f5f",
    measurementId: "G-SJM0S76BZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
