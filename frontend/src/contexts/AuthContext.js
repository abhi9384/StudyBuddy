import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

// Replace these values with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBd17VnQ4CSfwmqqRSLZsg8AkqcrhEUEU8",
  authDomain: "studybuddy-c61be.firebaseapp.com",
  projectId: "studybuddy-c61be",
  storageBucket: "studybuddy-c61be.firebasestorage.app",
  messagingSenderId: "156583292177",
  appId: "1:156583292177:web:86def06eca4851d35df0b0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
