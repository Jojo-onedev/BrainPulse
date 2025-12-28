import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore - Internal firebase export that might not be in main index.d.ts but is available in React Native environment
import { getReactNativePersistence } from "firebase/auth";

// TODO: Replace with your actual Firebase config keys
const firebaseConfig = {
    apiKey: "AIzaSyBGWZB7AUtmHR_jzqx65MujHYcsaCEvPLg",
    authDomain: "brainpluse-848f8.firebaseapp.com",
    projectId: "brainpluse-848f8",
    storageBucket: "brainpluse-848f8.firebasestorage.app",
    messagingSenderId: "958169329322",
    appId: "1:958169329322:web:b616f5fbfc66a1e7ebaad3",
    measurementId: "G-1NSTXTCK6C"
};

let app;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Initialize Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
        persistence: (getReactNativePersistence as any)(AsyncStorage)
    });
} else {
    app = getApp();
    auth = getAuth(app);
}

const firestore = getFirestore(app);

export { auth, firestore };
