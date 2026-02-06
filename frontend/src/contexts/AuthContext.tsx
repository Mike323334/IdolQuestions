import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { checkUsernameAvailability } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  merchantId?: string;
  stripeAccountId?: string;
  paypalVerified: boolean;
  role: 'Content Creator' | 'Follower';
  createdAt: string;
  deletionRequestedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role?: 'Content Creator' | 'Follower') => Promise<boolean>;
  signInWithGoogle: (role?: 'Content Creator' | 'Follower', usernameOverride?: string) => Promise<{ success: boolean; needsRole: boolean }>;
  completeGoogleSignup: (role: 'Content Creator' | 'Follower', usernameOverride?: string) => Promise<boolean>;
  logout: () => void;
  requestAccountDeletion: () => Promise<boolean>;
  updatePayPalVerification: (verified: boolean, merchantId?: string) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserProfile = async (uid: string): Promise<User | null> => {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as Partial<User> & { createdAt?: any };
    return {
      id: uid,
      username: data.username || 'User',
      email: data.email || '',
      merchantId: data.merchantId,
      stripeAccountId: data.stripeAccountId,
      paypalVerified: data.paypalVerified ?? false,
      role: (data.role as User['role']) || 'Follower',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
      deletionRequestedAt: data.deletionRequestedAt,
    };
  };

  const ensureUserProfile = async (
    uid: string,
    defaults: { username: string; email: string; role: 'Content Creator' | 'Follower' }
  ): Promise<User> => {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const newProfile: User = {
        id: uid,
        username: defaults.username,
        email: defaults.email,
        paypalVerified: false,
        role: defaults.role,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      });
      return newProfile;
    }

    const data = snapshot.data() as Partial<User> & { createdAt?: any };
    return {
      id: uid,
      username: data.username || defaults.username,
      email: data.email || defaults.email,
      merchantId: data.merchantId,
      stripeAccountId: data.stripeAccountId,
      paypalVerified: data.paypalVerified ?? false,
      role: (data.role as User['role']) || defaults.role,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
      deletionRequestedAt: data.deletionRequestedAt,
    };
  };

  const register = async (username: string, email: string, password: string, role: 'Content Creator' | 'Follower' = 'Follower'): Promise<boolean> => {
    try {
      // First check if username is available
      const usernameCheck = await checkUsernameAvailability(username);
      if (!usernameCheck.available) {
        throw new Error(usernameCheck.message);
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username });
      }
      const profile = await ensureUserProfile(credential.user.uid, {
        username,
        email,
        role,
      });
      setUser(profile);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await ensureUserProfile(credential.user.uid, {
        username: credential.user.displayName || email.split('@')[0],
        email,
        role: 'Follower',
      });
      setUser(profile);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signInWithGoogle = async (
    role?: 'Content Creator' | 'Follower',
    usernameOverride?: string
  ): Promise<{ success: boolean; needsRole: boolean }> => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credential.user;
      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (existingProfile) {
        setUser(existingProfile);
        return { success: true, needsRole: false };
      }

      if (!role) {
        return { success: true, needsRole: true };
      }

      const displayName = usernameOverride || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      
      // Check username availability if using override
      if (usernameOverride) {
        const usernameCheck = await checkUsernameAvailability(usernameOverride);
        if (!usernameCheck.available) {
          throw new Error(usernameCheck.message);
        }
      }
      
      if (auth.currentUser && usernameOverride) {
        await updateProfile(auth.currentUser, { displayName });
      }
      const profile = await ensureUserProfile(firebaseUser.uid, {
        username: displayName,
        email: firebaseUser.email || '',
        role,
      });
      setUser(profile);
      return { success: true, needsRole: false };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, needsRole: false };
    }
  };

  const completeGoogleSignup = async (
    role: 'Content Creator' | 'Follower',
    usernameOverride?: string
  ): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;
      const firebaseUser = auth.currentUser;
      const displayName = usernameOverride || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      
      // Check username availability if using override
      if (usernameOverride) {
        const usernameCheck = await checkUsernameAvailability(usernameOverride);
        if (!usernameCheck.available) {
          throw new Error(usernameCheck.message);
        }
        await updateProfile(firebaseUser, { displayName });
      }
      
      const profile = await ensureUserProfile(firebaseUser.uid, {
        username: displayName,
        email: firebaseUser.email || '',
        role,
      });
      setUser(profile);
      return true;
    } catch (error) {
      console.error('Google signup completion error:', error);
      return false;
    }
  };

  const logout = () => {
    signOut(auth).finally(() => setUser(null));
  };

  const requestAccountDeletion = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        deletionRequestedAt: new Date().toISOString(),
      });
      setUser({ ...user, deletionRequestedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      return false;
    }
  };

  const updatePayPalVerification = async (verified: boolean, merchantId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        paypalVerified: verified,
        merchantId: merchantId || user.merchantId || null,
      });
      setUser({
        ...user,
        paypalVerified: verified,
        merchantId: merchantId || user.merchantId,
      });
      return true;
    } catch (error) {
      console.error('Error updating PayPal verification:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    signInWithGoogle,
    completeGoogleSignup,
    logout,
    requestAccountDeletion,
    updatePayPalVerification,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
