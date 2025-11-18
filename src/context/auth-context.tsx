'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { UserProfile } from '@/lib/data';


interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isArticleSaved: (articleId: string) => boolean;
  toggleSaveArticle: (articleId: string) => void;
  addReadingHistory: (articleId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
        setIsUserLoading(false);
        setUserError(new Error("Auth service not available."));
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setUser(fbUser);
        setIsUserLoading(false);
    }, (error) => {
        setUserError(error);
        setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(isUserLoading || (user ? isProfileLoading : false));
  }, [isUserLoading, isProfileLoading, user]);

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email login.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name: string, email: string, password?: string) => {
    if (!password) throw new Error("Password is required for email signup.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
        const newUser = userCredential.user;
        await updateProfile(newUser, { displayName: name });
        const userProfileDocRef = doc(firestore, "users", newUser.uid);
        const newProfile: UserProfile = {
            id: newUser.uid,
            username: name,
            email: email,
            bio: '새로운 작가입니다! 제 이야기를 세상과 공유하게 되어 기쁩니다.',
            readingList: [],
            readingHistory: [],
        };
        setDocumentNonBlocking(userProfileDocRef, newProfile, { merge: true });
    }
  }
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    if (googleUser && googleUser.email) {
        const userProfileDocRef = doc(firestore, "users", googleUser.uid);
        const newProfile: UserProfile = {
            id: googleUser.uid,
            username: googleUser.displayName || 'New User',
            email: googleUser.email,
            bio: 'Joined through Google! Excited to share my stories.',
            readingList: [],
            readingHistory: [],
        };
        setDocumentNonBlocking(userProfileDocRef, newProfile, { merge: true });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isArticleSaved = useCallback((articleId: string) => {
    return userProfile?.readingList?.includes(articleId) ?? false;
  }, [userProfile]);

  const toggleSaveArticle = useCallback((articleId: string) => {
    if (!user || !userProfile) return;
    
    const userProfileDocRef = doc(firestore, 'users', user.uid);
    const isCurrentlySaved = userProfile.readingList?.includes(articleId);

    updateDocumentNonBlocking(userProfileDocRef, {
        readingList: isCurrentlySaved ? arrayRemove(articleId) : arrayUnion(articleId)
    });

  }, [user, userProfile, firestore]);
  
  const addReadingHistory = useCallback((articleId: string) => {
    if (!user || !userProfile) return;
    
    const userProfileDocRef = doc(firestore, 'users', user.uid);
    // Add to history only if it's not already there
    if (!userProfile.readingHistory?.includes(articleId)) {
        updateDocumentNonBlocking(userProfileDocRef, {
            readingHistory: arrayUnion(articleId)
        });
    }
  }, [user, userProfile, firestore]);

  const value = {
      user,
      userProfile: userProfile ?? null,
      loading,
      login,
      signup,
      logout,
      signInWithGoogle,
      isArticleSaved,
      toggleSaveArticle,
      addReadingHistory,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
