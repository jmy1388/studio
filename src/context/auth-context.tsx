'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { findUser, addUser, type User } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => User | null;
  signup: (name: string, email: string, password?: string) => User | null;
  logout: () => void;
  savedArticles: string[];
  readingHistory: string[];
  isArticleSaved: (articleId: string) => boolean;
  toggleSaveArticle: (articleId: string) => void;
  addReadingHistory: (articleId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('oob-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const storedSaved = localStorage.getItem(`oob-saved-${parsedUser.id}`);
        const storedHistory = localStorage.getItem(`oob-history-${parsedUser.id}`);
        if(storedSaved) setSavedArticles(JSON.parse(storedSaved));
        if(storedHistory) setReadingHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('oob-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocalStorage = (userId: string, saved: string[], history: string[]) => {
    localStorage.setItem(`oob-saved-${userId}`, JSON.stringify(saved));
    localStorage.setItem(`oob-history-${userId}`, JSON.stringify(history));
  }

  const login = (email: string, password?: string) => {
    const foundUser = findUser(email, password);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      localStorage.setItem('oob-user', JSON.stringify(userToStore));
      setUser(userToStore);
      
      const storedSaved = localStorage.getItem(`oob-saved-${foundUser.id}`);
      const storedHistory = localStorage.getItem(`oob-history-${foundUser.id}`);
      const userSaved = storedSaved ? JSON.parse(storedSaved) : [];
      const userHistory = storedHistory ? JSON.parse(storedHistory) : [];

      setSavedArticles(userSaved);
      setReadingHistory(userHistory);
      return userToStore;
    }
    return null;
  };

  const signup = (name: string, email: string, password?: string) => {
    if(findUser(email)){
        // User already exists
        return null;
    }
    // In a real app, you would hash the password
    const newUser = addUser({ name, email, password, bio: 'oob의 새로운 작가입니다.', avatarId: 'user-3' });
    const { password: _, ...userToStore } = newUser;
    localStorage.setItem('oob-user', JSON.stringify(userToStore));
    setUser(userToStore);
    setSavedArticles([]);
    setReadingHistory([]);
    return userToStore;
  }

  const logout = () => {
    localStorage.removeItem('oob-user');
    setUser(null);
    setSavedArticles([]);
    setReadingHistory([]);
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
    updateLocalStorage(user.id, newSaved, readingHistory);
  };
  
  const addReadingHistory = (articleId: string) => {
    if (!user || readingHistory.includes(articleId)) return;
    const newHistory = [...readingHistory, articleId];
    setReadingHistory(newHistory);
    updateLocalStorage(user.id, savedArticles, newHistory);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, savedArticles, isArticleSaved, toggleSaveArticle, readingHistory, addReadingHistory }}>
      {children}
    </AuthContext.Provider>
  );
};
