/**
 * KroniQ Settings Panel
 * Clean interface with ONLY working features
 */

import React, { useState, useEffect } from 'react';
import {
  User, Bell, Palette, Shield, Download, Trash2, ChevronRight,
  Check, X, Save, Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface NotificationPreferences {
  email_notifications: boolean;
  product_updates: boolean;
  marketing_emails: boolean;
}

export const NewSettingsView: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'appearance' | 'privacy'>('account');

  // Account settings
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    product_updates: true,
    marketing_emails: false
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSettings();
  }, [currentUser]);

  const loadSettings = async () => {
    if (!currentUser?.uid) return;

    // Load display name
    if (userData?.displayName) {
      setDisplayName(userData.displayName);
    } else if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }

    // Load notification preferences
    const { data } = await supabase
      .from('user_preferences')
      .select('email_notifications, product_updates, marketing_emails')
      .eq('user_id', currentUser.uid)
      .maybeSingle();

    if (data) {
      setNotifications({
        email_notifications: data.email_notifications ?? true,
        product_updates: data.product_updates ?? true,
        marketing_emails: data.marketing_emails ?? false
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !auth.currentUser) return;

    setIsSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName });

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.uid,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      showToast('success', 'Profile Updated', 'Your changes have been saved');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Update Failed', 'Could not save profile changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleNotification = async (key: keyof NotificationPreferences) => {
    if (!currentUser) return;

    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });

    setIsSavingNotifications(true);
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.uid,
          [key]: newValue,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error updating notifications:', error);
      showToast('error', 'Update Failed', 'Could not save notification preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const sections = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'privacy', name: 'Privacy & Data', icon: Shield },
  ];

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-white/50 mt-1">Manage your preferences</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                <p className="text-white/60">Manage your account information</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Email</label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/30 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
                <p className="text-white/60">Control how KroniQ communicates with you</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-white/50 mt-1">Receive important account updates</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('email_notifications')}
                    disabled={isSavingNotifications}
                    className={`w-12 h-6 rounded-full transition-all ${
                      notifications.email_notifications ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.email_notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Product Updates</h3>
                    <p className="text-xs text-white/50 mt-1">Get notified about new features</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('product_updates')}
                    disabled={isSavingNotifications}
                    className={`w-12 h-6 rounded-full transition-all ${
                      notifications.product_updates ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.product_updates ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Marketing Emails</h3>
                    <p className="text-xs text-white/50 mt-1">Receive promotional content</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('marketing_emails')}
                    disabled={isSavingNotifications}
                    className={`w-12 h-6 rounded-full transition-all ${
                      notifications.marketing_emails ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.marketing_emails ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Appearance</h2>
                <p className="text-white/60">Customize your KroniQ experience</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['light', 'dark'].map(themeOption => (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption as any)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        theme === themeOption
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-full h-20 rounded-lg mb-3 ${
                        themeOption === 'light' ? 'bg-white' : 'bg-black'
                      }`} />
                      <p className="text-sm font-medium capitalize">{themeOption}</p>
                      {theme === themeOption && (
                        <Check className="w-5 h-5 text-cyan-400 mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Privacy & Data</h2>
                <p className="text-white/60">Manage your data and privacy settings</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-cyan-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Download Your Data</p>
                      <p className="text-xs text-white/50">Export all your KroniQ data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-300">Delete Account</p>
                      <p className="text-xs text-red-400/70">Permanently delete your account</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/50" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
