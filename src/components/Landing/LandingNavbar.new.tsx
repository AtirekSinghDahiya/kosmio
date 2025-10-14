import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  currentPage: 'home' | 'about' | 'pricing' | 'contact';
  onNavigate: (page: 'home' | 'about' | 'pricing' | 'contact') => void;
  onGetStarted: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ currentPage, onNavigate, onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const container = document.querySelector('[data-scroll-container]');
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 ${
      isScrolled ? 'py-3' : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className={`glass-panel rounded-2xl px-6 md:px-8 py-3 border transition-all duration-300 ${
          isScrolled ? 'border-white/10 bg-slate-900/95' : 'border-white/5 bg-slate-900/60'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
                <img
                  src="/logo.svg"
                  alt="Kosmio"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">Kosmio</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={`relative text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGetStarted}
                className="hidden sm:block btn-primary px-6 py-2 rounded-lg text-sm"
              >
                Get Started
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-40 animate-scale-in">
          <div className="glass-panel-strong rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col gap-3">
