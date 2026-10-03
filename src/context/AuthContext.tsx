import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { UserProfile, UserRole, SavedTraveler } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAgent: boolean;
  isVerified: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName: string, phoneNumber?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  quickLogin: (type: 'super_admin' | 'agent' | 'customer') => Promise<void>;
  updateUserSavedTravelers: (travelers: SavedTraveler[]) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAILS = [
  'roysahil579@gmail.com',
  'subhojit2001mondal@gmail.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Rate limiting tracker
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastActionTime < 1000) {
      throw new Error('Please wait a moment before trying again.');
    }
    setLastActionTime(now);
  };

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      const emailNormalized = (firebaseUser.email || '').toLowerCase().trim();
      const isSuperEmail = SUPER_ADMIN_EMAILS.includes(emailNormalized);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If it's the bootstrapped owner email, guarantee super_admin role
        if (isSuperEmail && data.role !== 'super_admin') {
          const updated = { ...data, role: 'super_admin' as UserRole };
          await setDoc(userRef, updated, { merge: true });
          setProfile(updated);
        } else {
          setProfile(data);
        }
      } else {
        // Create initial profile document
        const newRole: UserRole = isSuperEmail ? 'super_admin' : 'customer';
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || emailNormalized.split('@')[0] || 'Traveler',
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          role: newRole,
          photoURL: firebaseUser.photoURL || '',
          isBlocked: false,
          savedTravelers: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Error fetching profile from Firestore:', err);
      // Fallback profile if offline
      const emailNormalized = (firebaseUser.email || '').toLowerCase().trim();
      const isSuperEmail = SUPER_ADMIN_EMAILS.includes(emailNormalized);
      setProfile({
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || 'Traveler',
        email: firebaseUser.email || '',
        role: isSuperEmail ? 'super_admin' : 'customer',
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    checkRateLimit();
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const signUp = async (email: string, pass: string, fullName: string, phoneNumber?: string) => {
    checkRateLimit();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: fullName });

    // Send email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Verification email error:', e);
    }

    const emailNormalized = email.toLowerCase().trim();
    const isSuperEmail = SUPER_ADMIN_EMAILS.includes(emailNormalized);
    const role: UserRole = isSuperEmail ? 'super_admin' : 'customer';

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      fullName,
      email: cred.user.email || '',
      phoneNumber: phoneNumber || '',
      role,
      photoURL: '',
      isBlocked: false,
      savedTravelers: [],
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    checkRateLimit();
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await fetchProfile(result.user);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    checkRateLimit();
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Quick Demo Login for instant testing & evaluation
  const quickLogin = async (type: 'super_admin' | 'agent' | 'customer') => {
    let email = '';
    let pass = '';
    let name = '';

    if (type === 'super_admin') {
      email = 'Roysahil579@gmail.com';
      pass = 'Illusio@006574';
      name = 'Sahil Roy (Super Admin)';
    } else if (type === 'agent') {
      email = 'agent.vikram@illusiontravel.com';
      pass = 'illusion123';
      name = 'Vikram Negi (Tour Agent)';
    } else {
      email = 'wanderer.guest@illusiontravel.com';
      pass = 'illusion123';
      name = 'Aarav Sharma';
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // If super_admin was created with the previous password, automatically migrate it to Illusio@006574
      if (type === 'super_admin' && (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password')) {
        try {
          const oldCred = await signInWithEmailAndPassword(auth, email, 'aaaaa');
          await updatePassword(oldCred.user, pass);
          return;
        } catch {
          // If old password fails, continue to create user
        }
      }

      // If user does not exist yet, automatically register demo account
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(cred.user, { displayName: name });
          const role: UserRole = type === 'super_admin' ? 'super_admin' : type === 'agent' ? 'agent' : 'customer';
          const p: UserProfile = {
            uid: cred.user.uid,
            fullName: name,
            email,
            phoneNumber: '+91 98765 00000',
            role,
            isBlocked: false,
            savedTravelers: [],
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', cred.user.uid), p);
          setProfile(p);
        } catch (regErr) {
          console.error('Failed to create demo account:', regErr);
          throw regErr;
        }
      } else {
        throw err;
      }
    }
  };

  const updateUserSavedTravelers = async (travelers: SavedTraveler[]) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { savedTravelers: travelers });
    setProfile((prev) => (prev ? { ...prev, savedTravelers: travelers } : null));
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const role: UserRole = profile?.role || 'customer';
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = isSuperAdmin || role === 'admin';
  const isAgent = isAdmin || role === 'agent';
  const isVerified = user?.emailVerified || role === 'super_admin' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isSuperAdmin,
        isAgent,
        isVerified,
        loading,
        login,
        signUp,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerification,
        quickLogin,
        updateUserSavedTravelers,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
