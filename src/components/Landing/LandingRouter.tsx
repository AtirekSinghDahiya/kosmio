import React, { useState, useRef, useEffect } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HomePage } from './HomePage';
import { AboutPage } from './AboutPage';
import { PricingPage } from './PricingPage';
import { ContactPage } from './ContactPage';
import { FloatingElements } from './FloatingElements';
import { CosmicBackground } from '../Layout/CosmicBackground';

interface LandingRouterProps {
  onGetStarted: () => void;
}

export const LandingRouter: React.FC<LandingRouterProps> = ({ onGetStarted }) => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'pricing' | 'contact'>('home');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: 'home' | 'about' | 'pricing' | 'contact') => {
    setCurrentPage(page);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGetStarted={onGetStarted} />;
      case 'about':
        return <AboutPage />;
      case 'pricing':
        return <PricingPage onGetStarted={onGetStarted} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onGetStarted={onGetStarted} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden gradient-background">
      <CosmicBackground />
      <FloatingElements />

      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        <LandingNavbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onGetStarted={onGetStarted}
        />

        <div className="relative">
          {renderPage()}
        </div>

        {/* Footer */}
        <footer className="relative py-16 px-4 border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFF0]/30 to-[#8A2BE2]/30 flex items-center justify-center p-2">
                    <img src="/logo.svg" alt="Kosmio" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xl font-bold text-white">Kosmio</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Empowering creators with AI-powered tools for the future of digital creation.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <button onClick={() => handleNavigate('home')} className="hover:text-white transition-colors">
                      Features
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('pricing')} className="hover:text-white transition-colors">
                      Pricing
                    </button>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">API</a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <button onClick={() => handleNavigate('about')} className="hover:text-white transition-colors">
                      About
                    </button>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Careers</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Blog</a>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('contact')} className="hover:text-white transition-colors">
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">Security</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/60 text-sm">
                Kosmio © 2025 — All rights reserved. Crafted with intelligence.
              </p>

              <div className="flex items-center gap-6">
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Twitter
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  LinkedIn
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  GitHub
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Discord
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
