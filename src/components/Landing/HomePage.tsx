import React, { useState, useEffect } from 'react';
import { MessageSquare, Code, Palette, Video, ArrowRight, Check, Sparkles, Zap, Star, TrendingUp, Users } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'Chat AI',
      description: 'Intelligent conversations powered by multiple AI models with context awareness and memory.',
      stats: '10M+ conversations',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Code,
      title: 'Code Studio',
      description: 'Generate, debug, and optimize code across multiple programming languages with AI assistance.',
      stats: '500K+ projects',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Palette,
      title: 'Design Studio',
      description: 'Create stunning visuals, logos, and UI designs with AI-powered creative tools.',
      stats: '2M+ designs',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Video,
      title: 'Video Studio',
      description: 'Edit, enhance, and generate video content with advanced AI video processing.',
      stats: '100K+ videos',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  const stats = [
    { icon: Users, value: '500K+', label: 'Active Users' },
    { icon: Sparkles, value: '50M+', label: 'AI Generations' },
    { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
    { icon: Star, value: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="relative w-full">
      {/* Animated Background Orbs */}
      <AnimatedGradientOrb className="top-20 left-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-20 right-10 w-[500px] h-[500px]" />
      <AnimatedGradientOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
        <div className={`max-w-7xl mx-auto text-center relative z-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Logo Animation */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] rounded-full blur-3xl opacity-50 animate-pulse-slow" />
            <div className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 shadow-2xl backdrop-blur-xl border-2 border-white/20 p-6 floating-animation">
              <img
                src="/logo.svg"
                alt="Kosmio"
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,255,240,0.8)]"
              />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="block mb-4">One AI.</span>
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-[#00FFF0] via-[#8A2BE2] to-[#00FFF0] bg-clip-text text-transparent blur-lg animate-gradient bg-[length:200%_auto]">
                Infinite Creation.
              </span>
              <span className="relative bg-gradient-to-r from-[#00FFF0] via-[#8A2BE2] to-[#00FFF0] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Infinite Creation.
              </span>
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Harness the power of <span className="text-[#00FFF0] font-semibold">multiple AI models</span> in one unified platform. Create, code, design, and deploy with <span className="text-[#8A2BE2] font-semibold">unprecedented speed</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button
              onClick={onGetStarted}
              className="group relative bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-[#00FFF0]/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative">Start Creating Free</span>
              <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => {
                const element = document.getElementById('features-showcase');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="glass-panel border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-[#00FFF0]/50"
            >
              Explore Features
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/70 text-sm">
            {[
              { icon: Check, text: 'No credit card required' },
              { icon: Zap, text: 'Instant activation' },
              { icon: Star, text: 'Trusted by 500K+ creators' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <Icon className="w-5 h-5 text-[#00FFF0]" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Floating3DCard key={idx} delay={idx * 100}>
                  <div className="glass-panel rounded-2xl p-8 border border-white/20 text-center group hover:border-[#00FFF0]/50 transition-all duration-500">
                    <Icon className="w-8 h-8 mx-auto mb-4 text-[#00FFF0] group-hover:scale-125 transition-transform duration-300" />
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-[#00FFF0] transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features-showcase" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8 animate-fade-in">
              <span className="text-[#00FFF0] text-sm font-bold tracking-wider">POWERFUL FEATURES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Everything You Need,{' '}
              <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Four specialized studios powered by cutting-edge AI models, designed to transform your creative workflow.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeFeature === idx;

              return (
                <Floating3DCard key={idx} delay={idx * 150}>
                  <div
                    onMouseEnter={() => setActiveFeature(idx)}
                    className={`relative group glass-panel rounded-3xl p-10 border transition-all duration-500 overflow-hidden cursor-pointer ${
                      isActive
                        ? 'border-[#00FFF0]/60 shadow-2xl shadow-[#00FFF0]/20 scale-105'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 ${
                      isActive ? 'opacity-20' : 'group-hover:opacity-10'
                    }`} />

                    {/* Animated Border Glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-3xl opacity-75">
                        <div className="absolute inset-[-2px] bg-gradient-to-r from-[#00FFF0] via-[#8A2BE2] to-[#00FFF0] rounded-3xl animate-spin-slow blur-sm" />
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20 flex items-center justify-center mb-6 transition-all duration-500 ${
                        isActive ? 'scale-110 opacity-30' : 'group-hover:scale-105'
                      }`}>
                        <Icon className={`w-10 h-10 text-white transition-all duration-500 ${
                          isActive ? 'scale-125' : ''
                        }`} />
                      </div>

                      {/* Content */}
                      <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
                      <p className="text-white/70 leading-relaxed mb-6 text-lg">{feature.description}</p>

                      {/* Stats Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full border border-white/20">
                        <Sparkles className="w-4 h-4 text-[#00FFF0]" />
                        <span className="text-sm text-white/80 font-semibold">{feature.stats}</span>
                      </div>
                    </div>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <Floating3DCard>
            <div className="relative glass-panel rounded-3xl p-16 border-2 border-white/20 backdrop-blur-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FFF0]/10 via-[#8A2BE2]/10 to-[#00FFF0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 text-center">
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Ready to{' '}
                  <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
                    Create Magic?
                  </span>
                </h2>
                <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
                  Join over 500,000 creators building the future with AI
                </p>

                <button
                  onClick={onGetStarted}
                  className="group bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white px-12 py-6 rounded-2xl font-bold text-2xl hover:shadow-2xl hover:shadow-[#00FFF0]/50 transition-all duration-300 hover:scale-110 inline-flex items-center gap-4"
                >
                  <span>Start Creating Now</span>
                  <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </Floating3DCard>
        </div>
      </section>
    </div>
  );
};
