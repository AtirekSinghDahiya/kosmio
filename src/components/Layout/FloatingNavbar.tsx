import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Zap, Briefcase, DollarSign, Home, Lightbulb, HelpCircle, BookOpen, Building2 } from 'lucide-react';
import { ProfilePage } from '../Profile/ProfilePage';
import { FeaturesPage } from '../Pages/FeaturesPage';
import { DocsPage } from '../Pages/DocsPage';
import { PricingModal } from '../Pages/PricingModal';
import { HelpModal } from '../Pages/HelpModal';
import { CareersModal } from '../Pages/CareersModal';
import { CustomSolutionsModal } from '../Pages/CustomSolutionsModal';

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
  const [showCustomSolutions, setShowCustomSolutions] = useState(false);

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
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-30 items-center justify-center pt-3 md:pt-5 px-4">
        <div className="relative group w-full md:w-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFF0]/20 via-[#8A2BE2]/20 to-[#00FFF0]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative glass-panel rounded-full px-3 md:px-8 py-2 md:py-3.5 shadow-2xl border border-white/20 backdrop-blur-2xl animate-fade-in-up hover:border-white/30 transition-all duration-300">
            <div className="flex items-center justify-center gap-2 md:gap-8 overflow-x-auto scrollbar-none">
              <button
                onClick={handleHomeClick}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <Home className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowFeatures(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <Lightbulb className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Features</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowPricing(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <DollarSign className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Pricing</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowDocs(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <BookOpen className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Docs</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowCareers(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <Briefcase className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Careers</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowCustomSolutions(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <Building2 className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Enterprise</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="relative flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/70 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 group/item whitespace-nowrap px-2 md:px-0"
              >
                <HelpCircle className="w-4 h-4 transition-transform group-hover/item:rotate-12" />
                <span className="hidden sm:inline">Help</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] group-hover/item:w-full transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed top-3 md:top-5 right-3 md:right-4 z-30 flex items-center gap-2 md:gap-3 animate-fade-in-up">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFF0]/10 to-[#8A2BE2]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl px-2 md:px-5 py-1.5 md:py-3 flex items-center gap-2 md:gap-4 shadow-xl transition-all duration-300">
            <div className="hidden md:flex items-center gap-2.5">
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

            <div className="hidden md:block w-px h-8 bg-white/20" />

            <button
              onClick={handleProfileClick}
              className="flex items-center gap-1.5 md:gap-2.5 hover:bg-white/10 rounded-xl px-1 md:px-2 py-1 md:py-1.5 transition-all duration-300 active:scale-95 group/profile"
            >
              <div className="relative w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-white/10 group-hover/profile:ring-white/30 transition-all duration-300">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-600/20 animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col">
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
      {showCustomSolutions && <CustomSolutionsModal onClose={() => setShowCustomSolutions(false)} />}
    </>
  );
};
