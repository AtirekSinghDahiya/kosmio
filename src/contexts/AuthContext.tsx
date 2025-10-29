import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
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
  user: User | null;
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

  const ensureTokenBalance = async (userId: string) => {
    console.log('💰 Checking token balance for user:', userId);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens_balance, daily_tokens_remaining, daily_free_tokens, current_tier, is_paid')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        const isFreeUser = !profile.is_paid && profile.current_tier === 'free';
        const relevantBalance = isFreeUser ? profile.daily_tokens_remaining : profile.tokens_balance;
        console.log(`💰 Current balance: ${relevantBalance} tokens (Free user: ${isFreeUser})`);

        // If user has 0 tokens, give them the daily free allocation
        if (relevantBalance === 0 && isFreeUser) {
          console.log('⚠️ Free user has 0 daily tokens, initializing with free daily allocation...');
          const { error } = await supabase
            .from('profiles')
            .update({
              tokens_balance: 5000,
              daily_tokens_remaining: 5000,
              last_token_refresh: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('❌ Error updating token balance:', error);
          } else {
            console.log('✅ Token balance initialized to 5,000 tokens');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring token balance:', error);
    }
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
        // Ensure the user has tokens
        await ensureTokenBalance(userId);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          display_name: displayName || email.split('@')[0],
          avatar_url: null,
          free_tokens_balance: 6667, // Daily free allocation (~10 messages)
          paid_tokens_balance: 0,
          current_tier: 'free',
          last_token_refresh: new Date().toISOString(),
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
      await createSupabaseProfile(userId, email, displayName);
      console.log('✅ Supabase profile created successfully');
      setUserData(profileData);
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      throw error;
    }
  };

  const fetchUserData = async (userId: string, email: string) => {
    console.log('👤 Fetching user data for:', userId);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        console.log('✅ Profile loaded from Supabase');
        setUserData({
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          photoURL: profile.photo_url,
          bio: profile.bio,
          birthday: profile.birthday,
          location: profile.location,
          phone: profile.phone,
          plan: profile.current_tier,
        });
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
      console.log('📤 Sending update to Supabase...');

      const supabaseData: any = {};
      if (data.displayName) supabaseData.display_name = data.displayName;
      if (data.photoURL) supabaseData.photo_url = data.photoURL;
      if (data.bio) supabaseData.bio = data.bio;
      if (data.birthday) supabaseData.birthday = data.birthday;
      if (data.location) supabaseData.location = data.location;
      if (data.phone) supabaseData.phone = data.phone;

      supabaseData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(supabaseData)
        .eq('id', currentUser.uid);

      if (error) throw error;

      console.log('✅ Profile updated successfully in Supabase');

      setUserData(prev => prev ? { ...prev, ...data } : null);
      console.log('✅ Local user data updated');
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      console.error('   Error message:', error.message);

      if (error.code === 'PGRST116') {
        throw new Error('Profile not found. Please contact support.');
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
    user: currentUser,
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
