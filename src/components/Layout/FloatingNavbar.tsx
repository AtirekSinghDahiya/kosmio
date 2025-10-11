import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Zap, Briefcase, DollarSign, Home, Lightbulb, HelpCircle, BookOpen } from 'lucide-react';
import { ProfilePage } from '../Profile/ProfilePage';
import { FeaturesPage } from '../Pages/FeaturesPage';
import { DocsPage } from '../Pages/DocsPage';
import { PricingModal } from '../Pages/PricingModal';
import { HelpModal } from '../Pages/HelpModal';
import { CareersModal } from '../Pages/CareersModal';

interface FloatingNavbarProps {
  onProfileOpen?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onProfileOpen }) => {
  const { userData } = useAuth();
  const { navigateTo } = useNavigation();
  const [showProfile, setShowProfile] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCareers, setShowCareers] = useState(false);

  const handleProfileClick = () => {
    if (onProfileOpen) {
      onProfileOpen();
    } else {
      setShowProfile(true);
    }
  };

  const handleHomeClick = () => {
    // Navigate to chat and clear any active project
    navigateTo('chat');
    // Trigger a page reload to reset state properly
    window.location.href = '/';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pt-4 px-4">
        <div className="glass-panel rounded-full px-6 py-3 shadow-2xl border border-white/20 backdrop-blur-2xl animate-fade-in-up">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setShowFeatures(true)}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <Lightbulb className="w-4 h-4" />
              Features
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <DollarSign className="w-4 h-4" />
              Pricing
            </button>
            <button
              onClick={() => setShowDocs(true)}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </button>
            <button
              onClick={() => setShowCareers(true)}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <Briefcase className="w-4 h-4" />
              Careers
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-110"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
          </div>
        </div>
      </nav>

      <div className="fixed top-4 right-4 z-40 flex items-center gap-3 animate-fade-in-up">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90">
                {userData?.tokensUsed?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-white/50">tokens</span>
            </div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 hover:bg-white/10 rounded-xl p-1 transition-all button-press"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90 capitalize">
                {userData?.plan || 'Free'}
              </span>
              <span className="text-xs text-white/50">Plan</span>
            </div>
          </button>
        </div>
      </div>

      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
      {showFeatures && <FeaturesPage onClose={() => setShowFeatures(false)} />}
      {showDocs && <DocsPage onClose={() => setShowDocs(false)} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showCareers && <CareersModal onClose={() => setShowCareers(false)} />}
    </>
  );
};
