import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { clearUnifiedCache } from '../lib/unifiedPremiumAccess';

// Extended User type with Firebase compatibility (uid property)
interface User extends SupabaseUser {
  uid: string; // Alias for id (Firebase compatibility)
}

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
  signInWithGoogle: () => Promise<void>;
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

  // Helper to create Firebase-compatible user object
  const createCompatibleUser = (supabaseUser: SupabaseUser): User => {
    return {
      ...supabaseUser,
      uid: supabaseUser.id // Add uid alias for Firebase compatibility
    } as User;
  };
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
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens_balance, free_tokens_balance')
        .eq('id', userId)
        .maybeSingle();

      if (!profile || (!profile.tokens_balance && !profile.free_tokens_balance)) {
        console.log('🪙 Initializing token balances...');
        await supabase
          .from('profiles')
          .update({
            tokens_balance: 5000000,
            free_tokens_balance: 150000,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error ensuring token balance:', error);
    }
  };

  const createSupabaseProfile = async (userId: string, email: string, displayName?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          display_name: displayName || '',
          photo_url: '',
          bio: '',
          location: '',
          phone: '',
          current_tier: 'free',
          tokens_balance: 5000000,
          free_tokens_balance: 150000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      console.log('✅ Profile created in Supabase');
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate key')) {
        console.log('ℹ️ Profile already exists');
      } else {
        console.error('❌ Error creating profile:', error);
        throw error;
      }
    }
  };

  const createDefaultProfile = async (userId: string, email: string, displayName?: string) => {
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
      setUserData(profileData);
    } catch (error) {
      throw error;
    }
  };

  const fetchUserData = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
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
        await createDefaultProfile(userId, email);
      }
    } catch (error) {
      setUserData(null);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      console.log('🔐 Signing up with Supabase...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || ''
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ User created:', data.user.id);
        clearUnifiedCache(data.user.id);
        await createDefaultProfile(data.user.id, email, displayName);
        updateSessionTimestamp();
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);

      // Translate Supabase error codes to user-friendly messages
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.message?.includes('invalid email')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message?.includes('Password should be at least')) {
        throw new Error('Password should be at least 6 characters.');
      }

      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Starting Google sign in with Supabase...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      console.log('✅ Google OAuth initiated');
      updateSessionTimestamp();
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);

      if (error.message?.includes('popup')) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('🔐 Signing in with Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Sign in successful');
        updateSessionTimestamp();
        clearUnifiedCache(data.user.id);
        await ensureTokenBalance(data.user.id);
        await fetchUserData(data.user.id, data.user.email!);
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);

      // Translate Supabase error codes to user-friendly messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in.');
      }

      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setCurrentUser(null);
      setUserData(null);
      clearSession();
      clearUnifiedCache();
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) {
      throw new Error('No user logged in. Please sign in first.');
    }

    try {
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
        .eq('id', currentUser.id);

      if (error) throw error;

      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.id, currentUser.email!);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    console.log('🔄 Setting up auth listener...');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);

      if (session?.user) {
        setCurrentUser(createCompatibleUser(session.user));
        updateSessionTimestamp();

        // Fetch or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile) {
          console.log('📝 Creating profile for new user...');
          await createDefaultProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.display_name || session.user.user_metadata?.full_name
          );
        } else {
          await ensureTokenBalance(session.user.id);
          await fetchUserData(session.user.id, session.user.email!);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    // Check session validity periodically
    const sessionCheck = setInterval(() => {
      if (currentUser && !checkSessionValidity()) {
        console.log('⏰ Session expired, signing out...');
        signOut();
      }
    }, 60000);

    return () => {
      authListener.subscription.unsubscribe();
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
    signInWithGoogle,
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
