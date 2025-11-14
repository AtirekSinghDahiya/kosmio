import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface ProfileButtonProps {
  tokenBalance?: number;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ tokenBalance: propTokenBalance = 0 }) => {
  const { currentUser, signOut, userData } = useAuth();
  const { navigateTo } = useNavigation();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(propTokenBalance);

  // Fetch real-time token balance from Supabase
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchTokenBalance = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tokens_balance')
          .eq('id', currentUser.uid)
          .maybeSingle();

        if (!error && data) {
          setTokenBalance(data.tokens_balance || 0);
        }
      } catch (err) {
        console.error('Error fetching token balance:', err);
      }
    };

    fetchTokenBalance();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`token-balance-${currentUser.uid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUser.uid}`
        },
        (payload) => {
          console.log('\ud83d\udcb0 Token balance update received:', payload.new);
          if (payload.new && 'tokens_balance' in payload.new) {
            const newBalance = payload.new.tokens_balance;
            console.log(`\u2705 Updating token balance to: ${newBalance?.toLocaleString()}`);
            setTokenBalance(newBalance);
          }
        }
      )
      .subscribe((status) => {
        console.log('\ud83d\udd14 Token balance subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.uid]);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  if (!currentUser) return null;

  const initials = getInitials(userData?.displayName, currentUser.email || '');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${
          theme === 'light'
            ? 'bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-blue-400'
            : 'bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-2 border-white/10 hover:border-cyan-400/50'
        } backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]`}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          theme === 'light'
            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
            : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
        } shadow-lg`}>
          {userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt={userData.displayName || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Token Balance */}
        <div className="flex flex-col items-start">
          <span className={`text-xs font-semibold ${
            theme === 'light' ? 'text-gray-500' : 'text-white/50'
          }`}>
            Tokens
          </span>
          <span className={`text-sm font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-cyan-400'
          }`}>
            {formatTokens(tokenBalance)}
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className={`absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden ${
            theme === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-slate-900/98 border-white/20'
          } backdrop-blur-2xl animate-fade-in`}>
            {/* User Info Section */}
            <div className={`p-4 border-b ${
              theme === 'light' ? 'border-gray-200' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                } shadow-lg`}>
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {userData?.displayName || 'User'}
                  </p>
                  <p className={`text-xs truncate ${
                    theme === 'light' ? 'text-gray-500' : 'text-white/50'
                  }`}>
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Token Balance Detail */}
              <div className={`mt-3 p-3 rounded-lg ${
                theme === 'light'
                  ? 'bg-blue-50'
                  : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    theme === 'light' ? 'text-gray-600' : 'text-white/60'
                  }`}>
                    Token Balance
                  </span>
                  <span className={`text-lg font-bold ${
                    theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                  }`}>
                    {tokenBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  navigateTo('profile');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-50 text-gray-700'
                    : 'hover:bg-white/5 text-white/90'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Profile</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('settings');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-50 text-gray-700'
                    : 'hover:bg-white/5 text-white/90'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('billing');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-50 text-gray-700'
                    : 'hover:bg-white/5 text-white/90'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Billing & Tokens</span>
              </button>
            </div>

            {/* Logout */}
            <div className={`border-t ${
              theme === 'light' ? 'border-gray-200' : 'border-white/10'
            }`}>
              <button
                onClick={async () => {
                  await signOut();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-red-50 text-red-600'
                    : 'hover:bg-red-500/10 text-red-400'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
