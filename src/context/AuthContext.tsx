import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { auth, firestore } from '../services/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { uploadImage } from '../services/storage';

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, photoURL?: string) => Promise<void>;
    updateProfile: (displayName: string, photoURL?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    updateProfile: async () => { },
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Listen to user data in real-time
                unsubscribeSnapshot = onSnapshot(
                    doc(firestore, 'users', firebaseUser.uid),
                    (snapshot: DocumentSnapshot) => {
                        if (snapshot.exists()) {
                            setUser(snapshot.data() as AppUser);
                        } else {
                            console.warn('User authenticated but no Firestore doc found');
                        }
                        setLoading(false);
                    },
                    (error: FirestoreError) => {
                        console.error('Error in user snapshot listener:', error);
                        setLoading(false);
                    }
                );
            } else {
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, displayName: string, photoURL?: string) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            let finalPhotoURL = photoURL || '';

            // If photoURL is a local file URI (not starting with http), upload it
            if (photoURL && !photoURL.startsWith('http')) {
                try {
                    finalPhotoURL = await uploadImage(photoURL, `avatars/${firebaseUser.uid}_${Date.now()}.jpg`);
                } catch (uploadError) {
                    console.error('Initial avatar upload failed, using placeholder:', uploadError);
                }
            }

            const newUser: AppUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || email,
                displayName: displayName,
                createdAt: Date.now(),
                isPremium: false,
                photoURL: finalPhotoURL,
                stats: {
                    totalQuizzesPlayed: 0,
                    totalScore: 0,
                    averageScore: 0,
                    bestCategory: '',
                },
                favorites: [],
            };

            // Create user document in Firestore
            await setDoc(doc(firestore, 'users', firebaseUser.uid), newUser);
            setUser(newUser);

        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const updateProfile = async (displayName: string, photoURL?: string) => {
        if (!auth.currentUser) throw new Error('No user logged in');

        try {
            let finalPhotoURL = photoURL || '';

            // Handle image upload if photoURL is a local path (not starting with http)
            if (photoURL && !photoURL.startsWith('http')) {
                finalPhotoURL = await uploadImage(photoURL, `avatars/${auth.currentUser.uid}_${Date.now()}.jpg`);
            }

            const userRef = doc(firestore, 'users', auth.currentUser.uid);
            await setDoc(userRef, {
                displayName,
                photoURL: finalPhotoURL,
            }, { merge: true });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, updateProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
