import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { supabase } from '../lib/supabaseClient';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  birthday?: string;
  location?: string;
  phone?: string;
  plan?: string;
  tokensUsed?: number;
  tokensLimit?: number;
  aiPersonality?: string;
  aiCreativityLevel?: number;
  aiResponseLength?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const SESSION_KEY = 'kroniq_session_timestamp';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSessionTimestamp = () => {
    localStorage.setItem(SESSION_KEY, Date.now().toString());
  };

  const checkSessionValidity = (): boolean => {
    const timestamp = localStorage.getItem(SESSION_KEY);
    if (!timestamp) return false;

    const elapsed = Date.now() - parseInt(timestamp, 10);
    return elapsed < SESSION_TIMEOUT_MS;
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const createSupabaseProfile = async (userId: string, email: string, displayName?: string) => {
    console.log('📝 Creating/updating Supabase profile for user:', userId);

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        console.log('✅ Supabase profile already exists');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          display_name: displayName || email.split('@')[0],
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error creating Supabase profile:', error);
      } else {
        console.log('✅ Supabase profile created successfully');
      }
    } catch (error) {
      console.error('❌ Error in createSupabaseProfile:', error);
    }
  };

  const createDefaultProfile = async (userId: string, email: string, displayName?: string) => {
    console.log('📝 Creating default profile for user:', userId);

    const profileData: UserData = {
      id: userId,
      email,
      displayName: displayName || '',
      photoURL: '',
      bio: '',
      location: '',
      phone: '',
      plan: 'starter',
      tokensUsed: 0,
      tokensLimit: 10000,
      aiPersonality: 'balanced',
      aiCreativityLevel: 5,
      aiResponseLength: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(doc(db, 'profiles', userId), profileData);
      console.log('✅ Firestore profile created successfully');

      await createSupabaseProfile(userId, email, displayName);

      setUserData(profileData);
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      throw error;
    }
  };

  const fetchUserData = async (userId: string, email: string) => {
    console.log('👤 Fetching user data for:', userId);

    try {
      const userDoc = await getDoc(doc(db, 'profiles', userId));

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('✅ Profile loaded from Firestore');
        setUserData(data);

        await createSupabaseProfile(userId, email, data.displayName);
      } else {
        console.log('⚠️ Profile not found, creating new one...');
        await createDefaultProfile(userId, email);
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setUserData(null);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('🔐 Creating new user account...');
      console.log('   Email:', email);
      console.log('   Password length:', password?.length || 0);
      console.log('   Display name:', displayName);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      console.log('   Firebase auth instance:', auth ? 'OK' : 'NULL');
      console.log('   Firebase project:', auth?.app?.options?.projectId);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User account created:', userCredential.user.uid);
      console.log('   Email verified:', userCredential.user.emailVerified);

      await createDefaultProfile(userCredential.user.uid, email, displayName);
      console.log('✅ Sign up complete!');
    } catch (error: any) {
      console.error('❌ Error during sign up:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);

      // Translate Firebase error codes to user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password sign up is not enabled. Please contact support.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in...');
      console.log('   Email:', email);
      console.log('   Password length:', password?.length || 0);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('   Firebase auth instance:', auth ? 'OK' : 'NULL');
      console.log('   Firebase project:', auth?.app?.options?.projectId);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      updateSessionTimestamp();
      console.log('✅ Sign in successful - session created');
      console.log('   User ID:', userCredential.user.uid);
      console.log('   Email:', userCredential.user.email);
    } catch (error: any) {
      console.error('❌ Error during sign in:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);

      // Translate Firebase error codes to user-friendly messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please try again.');
      }

      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await firebaseSignOut(auth);
      clearSession();
      setUserData(null);
      console.log('✅ Sign out successful - session cleared');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) {
      const error = new Error('No user logged in. Please sign in first.');
      console.error('❌ Update failed:', error.message);
      throw error;
    }

    console.log('💾 Updating user profile...');
    console.log('   User ID:', currentUser.uid);
    console.log('   Data to update:', Object.keys(data));

    try {
      const updatedData = {
        ...data,
        updatedAt: new Date()
      };

      console.log('📤 Sending update to Firestore...');
      await updateDoc(doc(db, 'profiles', currentUser.uid), updatedData);
      console.log('✅ Profile updated successfully in Firestore');

      setUserData(prev => prev ? { ...prev, ...updatedData } : null);
      console.log('✅ Local user data updated');
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);

      // Provide more helpful error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Firebase rules need to be deployed. Run: firebase deploy --only firestore:rules');
      } else if (error.code === 'unavailable') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'not-found') {
        throw new Error('Profile not found. Try signing out and back in.');
      } else {
        throw new Error(error.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.uid, currentUser.email || '');
    }
  };

  useEffect(() => {
    console.log('👂 Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? user.uid : 'No user');

      if (user) {
        // Always create/update session on auth state change
        updateSessionTimestamp();
        console.log('   Creating/updating session...');

        setCurrentUser(user);
        await fetchUserData(user.uid, user.email || '');
        console.log('✅ User authenticated');
      } else {
        console.log('   No user, clearing state');
        setCurrentUser(null);
        setUserData(null);
        clearSession();
      }

      setLoading(false);
    });

    const activityHandler = () => {
      if (currentUser && checkSessionValidity()) {
        updateSessionTimestamp();
      }
    };

    window.addEventListener('click', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('scroll', activityHandler);

    const sessionCheck = setInterval(() => {
      if (currentUser && !checkSessionValidity()) {
        console.log('⏰ Session timeout detected, signing out...');
        firebaseSignOut(auth);
      }
    }, 60000);

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('scroll', activityHandler);
      clearInterval(sessionCheck);
    };
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
