import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Mail, Zap, Crown, X, Camera, MapPin, Phone, Calendar, FileText, Sparkles, Sliders } from 'lucide-react';

interface ProfilePageProps {
  onClose: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
  const { currentUser, userData, updateUserProfile, refreshUserData } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [aiPersonality, setAiPersonality] = useState('balanced');
  const [aiCreativityLevel, setAiCreativityLevel] = useState(5);
  const [aiResponseLength, setAiResponseLength] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      console.log('📝 Loading profile data into form:', userData);
      setDisplayName(userData.displayName || '');
      setBio(userData.bio || '');
      setBirthday(userData.birthday || '');
      setLocation(userData.location || '');
      setPhone(userData.phone || '');
      setPhotoURL(userData.photoURL || '');
      setAiPersonality(userData.aiPersonality || 'balanced');
      setAiCreativityLevel(userData.aiCreativityLevel || 5);
      setAiResponseLength(userData.aiResponseLength || 'medium');
    }
  }, [userData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    console.log('📸 Uploading image...');
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoURL(result);
        setUploading(false);
        console.log('✅ Image loaded successfully');
        showToast('success', 'Image Loaded', 'Image preview updated');
      };
      reader.onerror = () => {
        console.error('❌ Error reading file');
        setUploading(false);
        showToast('error', 'Upload Failed', 'Could not read image file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      showToast('error', 'Upload Failed', 'Failed to upload image');
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      const errorMsg = 'You must be logged in to save profile changes.';
      setError(errorMsg);
      showToast('error', 'Not Authenticated', errorMsg);
      return;
    }

    if (!displayName.trim() && activeTab === 'profile') {
      const errorMsg = 'Display name cannot be empty.';
      setError(errorMsg);
      showToast('warning', 'Invalid Input', errorMsg);
      return;
    }

    console.log('💾 Saving profile changes...');
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const profileData = {
        displayName: displayName.trim() || '',
        bio: bio.trim() || '',
        birthday: birthday || '',
        location: location.trim() || '',
        phone: phone.trim() || '',
        photoURL: photoURL || '',
        aiPersonality: aiPersonality || 'balanced',
        aiCreativityLevel: aiCreativityLevel || 5,
        aiResponseLength: aiResponseLength || 'medium',
      };

      console.log('📤 Updating profile document:', profileData);
      await updateUserProfile(profileData);
      console.log('✅ Profile updated successfully');

      setSuccess(true);
      showToast('success', 'Profile Updated', 'Your changes have been saved successfully');

      await refreshUserData();

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);

      let errorMessage = 'Failed to save profile.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure Firebase rules are deployed correctly.';
        showToast('error', 'Permission Denied', 'Check Firebase security configuration');
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection.';
        showToast('error', 'Network Error', 'Check your internet connection');
      } else {
        errorMessage = error?.message || 'Failed to save profile. Please try again.';
        showToast('error', 'Save Failed', errorMessage);
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
        return 'from-cyan-500 to-blue-500';
      case 'enterprise':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const personalityOptions = [
    { value: 'creative', label: 'Creative', description: 'More imaginative and artistic responses' },
    { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
    { value: 'funny', label: 'Funny', description: 'Humorous and light-hearted' },
    { value: 'balanced', label: 'Balanced', description: 'Well-rounded and versatile' },
    { value: 'technical', label: 'Technical', description: 'Detailed and precise' },
    { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in flex flex-col">
        <div className="relative h-32 bg-gradient-to-br from-[#00FFF0]/30 to-[#8A2BE2]/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 glass-panel rounded-xl hover:bg-white/20 transition-all button-press"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 pb-6 -mt-16 relative overflow-y-auto flex-1">
          <div className="flex items-end gap-6 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-[#0a0a1f] overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] rounded-xl shadow-lg hover:shadow-xl transition-all button-press disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 pb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {displayName || userData?.displayName || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                <Mail className="w-4 h-4" />
                <span>{currentUser.email}</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getPlanBadgeColor(userData?.plan || 'free')} shadow-lg`}>
                <Crown className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white capitalize">
                  {userData?.plan || 'Free'} Plan
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 glass-panel rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm blur-transition flex items-center justify-center gap-2 ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white shadow-lg border border-[#00FFF0]/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Preferences
            </button>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Token Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Used</span>
                  <span className="text-white font-semibold">
                    {userData?.tokensUsed?.toLocaleString() || 0} / {userData?.tokensLimit?.toLocaleString() || 10000}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(((userData?.tokensUsed || 0) / (userData?.tokensLimit || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {activeTab === 'profile' && (
              <div className="glass-panel rounded-2xl p-6 border border-white/10 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-2">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#00FFF0] blur-transition"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Birthday
                      </label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#00FFF0] blur-transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#00FFF0] blur-transition resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#00FFF0] blur-transition"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-2 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#00FFF0] blur-transition"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="glass-panel rounded-2xl p-6 border border-white/10 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI Personality Customization
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-3">
                      Response Style
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personalityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAiPersonality(option.value)}
                          className={`p-4 rounded-xl text-left transition-all blur-transition ${
                            aiPersonality === option.value
                              ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 border border-[#00FFF0]/50 shadow-lg'
                              : 'glass-panel border border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm mb-1">
                            {option.label}
                          </div>
                          <div className="text-xs text-white/60">
                            {option.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-3 flex items-center gap-2">
                      <Sliders className="w-3 h-3" />
                      Creativity Level: {aiCreativityLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={aiCreativityLevel}
                      onChange={(e) => setAiCreativityLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #00FFF0 0%, #8A2BE2 ${aiCreativityLevel * 10}%, rgba(255,255,255,0.1) ${aiCreativityLevel * 10}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-2">
                      <span>Conservative</span>
                      <span>Experimental</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-3">
                      Response Length
                    </label>
                    <div className="flex gap-3">
                      {['short', 'medium', 'long'].map((length) => (
                        <button
                          key={length}
                          onClick={() => setAiResponseLength(length)}
                          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all blur-transition capitalize ${
                            aiResponseLength === length
                              ? 'bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 text-white border border-[#00FFF0]/50'
                              : 'glass-panel text-white/70 hover:text-white border border-white/10'
                          }`}
                        >
                          {length}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white py-3 px-4 rounded-xl font-medium hover:shadow-xl hover:shadow-[#00FFF0]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed button-press text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 glass-panel border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-all button-press"
              >
                Cancel
              </button>
            </div>

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm animate-fade-in-up">
                ✅ Profile updated successfully!
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm animate-fade-in-up flex items-start gap-2">
                <span className="text-red-400 font-bold">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold mb-1">Error saving profile</div>
                  <div className="text-xs text-red-200/80">{error}</div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
