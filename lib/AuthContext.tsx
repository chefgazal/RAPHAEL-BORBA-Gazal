'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, isLoaded: false });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}
