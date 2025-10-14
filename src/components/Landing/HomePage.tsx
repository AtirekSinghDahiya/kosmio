import React, { useState, useEffect } from 'react';
import { MessageSquare, Code, Palette, Video, ArrowRight, Check, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'Chat AI',
      description: 'Intelligent conversations powered by cutting-edge AI models',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Code,
      title: 'Code Studio',
      description: 'Generate and debug code across multiple languages',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Palette,
      title: 'Design Studio',
      description: 'Create stunning visuals with AI-powered tools',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Video,
      title: 'Video Studio',
      description: 'Professional video editing powered by AI',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const stats = [
    { icon: TrendingUp, value: '500K+', label: 'Active Users' },
    { icon: Sparkles, value: '50M+', label: 'Generations' },
    { icon: Zap, value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className={`max-w-6xl mx-auto text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Main Headline */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-8 border border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-300">AI-Powered Creative Platform</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Everything You Need,{' '}
              <span className="text-gradient">All in One Place</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
              Four specialized studios powered by cutting-edge AI models, designed to transform your creative workflow.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onGetStarted}
              className="btn-primary px-8 py-4 rounded-xl text-lg flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              className="btn-secondary px-8 py-4 rounded-xl text-lg"
            >
              View Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
            {[
              'No credit card required',
              'Free tier available',
              'Cancel anytime'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-8 text-center card-hover"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-8 h-8 mx-auto mb-4 text-cyan-400" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Four Powerful Studios
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-normal">
              Each studio is designed to excel at specific creative tasks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group glass-panel rounded-2xl p-8 card-hover border border-white/5 hover:border-white/20"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-90 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel-strong rounded-3xl p-12 md:p-16 text-center border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join over 500,000 creators building the future with AI
            </p>

            <button
              onClick={onGetStarted}
              className="btn-primary px-10 py-5 rounded-xl text-xl inline-flex items-center gap-3 group"
            >
              <span>Start Creating Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
