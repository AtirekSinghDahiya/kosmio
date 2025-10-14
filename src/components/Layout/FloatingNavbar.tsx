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
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pt-5 px-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFF0]/20 via-[#8A2BE2]/20 to-[#00FFF0]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative glass-panel rounded-full px-8 py-3.5 shadow-2xl border border-white/20 backdrop-blur-2xl animate-fade-in-up hover:border-white/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={handleHomeClick}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <Home className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowFeatures(true)}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <Lightbulb className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Features</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowPricing(true)}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <DollarSign className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Pricing</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowDocs(true)}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <BookOpen className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Docs</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowCareers(true)}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <Briefcase className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Careers</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="relative flex items-center gap-2 text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 group/item"
              >
                <HelpCircle className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span>Help</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed top-5 right-4 z-40 flex items-center gap-3 animate-fade-in-up">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFF0]/10 to-[#8A2BE2]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Zap className="w-4 h-4 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400 blur-sm opacity-50 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/90">
                  {userData?.tokensUsed?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-white/50 tracking-wide">TOKENS</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/20" />

            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2.5 hover:bg-white/10 rounded-xl px-2 py-1.5 transition-all duration-300 group/profile"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-white/10 group-hover/profile:ring-white/30 transition-all duration-300">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/90 capitalize tracking-wide">
                  {userData?.plan || 'Free'}
                </span>
                <span className="text-[10px] text-white/50 tracking-wider">PLAN</span>
              </div>
            </button>
          </div>
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
