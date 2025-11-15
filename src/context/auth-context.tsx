'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { addUser, findUser, User } from '@/lib/data';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  savedArticles: string[];
  readingHistory: string[];
  isArticleSaved: (articleId: string) => boolean;
  toggleSaveArticle: (articleId: string) => void;
  addReadingHistory: (articleId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, isUserLoading } = useFirebase();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!isUserLoading) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const storedSaved = localStorage.getItem(`oob-saved-${firebaseUser.uid}`);
          const storedHistory = localStorage.getItem(`oob-history-${firebaseUser.uid}`);
          if(storedSaved) setSavedArticles(JSON.parse(storedSaved));
          if(storedHistory) setReadingHistory(JSON.parse(storedHistory));
        } else {
          setSavedArticles([]);
          setReadingHistory([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isUserLoading, auth]);

  const updateLocalStorage = (userId: string, saved: string[], history: string[]) => {
    localStorage.setItem(`oob-saved-${userId}`, JSON.stringify(saved));
    localStorage.setItem(`oob-history-${userId}`, JSON.stringify(history));
  }

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email login.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name: string, email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email signup.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // You might want to update the user's profile with the name here
    // For now, we are not storing extra user info in firestore
  }
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.includes(articleId);
  };

  const toggleSaveArticle = (articleId: string) => {
    if (!user) return;
    let newSaved;
    if (savedArticles.includes(articleId)) {
      newSaved = savedArticles.filter(id => id !== articleId);
    } else {
      newSaved = [...savedArticles, articleId];
    }
    setSavedArticles(newSaved);
    updateLocalStorage(user.uid, newSaved, readingHistory);
  };
  
  const addReadingHistory = (articleId: string) => {
    if (!user || readingHistory.includes(articleId)) return;
    const newHistory = [...readingHistory, articleId];
    setReadingHistory(newHistory);
    updateLocalStorage(user.uid, savedArticles, newHistory);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, signInWithGoogle, savedArticles, isArticleSaved, toggleSaveArticle, readingHistory, addReadingHistory }}>
      {children}
    </AuthContext.Provider>
  );
};
