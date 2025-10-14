import React, { useState, useEffect } from 'react';
import { Target, Eye, Heart, Users, Award, Zap, Globe, Shield } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

export const AboutPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Innovation First',
      description: 'We push the boundaries of what\'s possible with AI, constantly evolving our platform with cutting-edge technology.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Heart,
      title: 'User-Centric Design',
      description: 'Every feature is crafted with our users in mind, ensuring an intuitive and delightful experience.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Your data security is paramount. We employ enterprise-grade encryption and never share your information.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Making powerful AI tools accessible to creators worldwide, regardless of technical expertise.',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former AI Research Lead at OpenAI, PhD in Machine Learning from Stanford',
      image: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Google Brain Engineer, Pioneer in multimodal AI systems',
      image: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Emily Watson',
      role: 'Head of Design',
      bio: 'Award-winning UX designer, previously led design at Figma',
      image: 'from-pink-500 to-rose-600'
    },
    {
      name: 'David Kim',
      role: 'Head of Engineering',
      bio: 'Built scalable systems at Amazon and Netflix for 10+ years',
      image: 'from-blue-500 to-indigo-600'
    }
  ];

  const milestones = [
    { year: '2023', event: 'Founded with vision to democratize AI', icon: Zap },
    { year: '2024', event: 'Reached 100K active users', icon: Users },
    { year: '2024', event: 'Launched Code & Design Studios', icon: Award },
    { year: '2025', event: 'Serving 500K+ creators globally', icon: Globe }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pb-20">
      <AnimatedGradientOrb className="top-40 right-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 left-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className={`relative pt-40 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8">
            <span className="text-[#00FFF0] text-sm font-bold tracking-wider">ABOUT KOSMIO</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              AI-Powered Creation
            </span>
          </h1>

          <p className="text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            We believe that powerful AI tools should be accessible to everyone. Kosmio empowers creators, developers, and businesses to harness the full potential of artificial intelligence without complexity.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Floating3DCard delay={0}>
            <div className="glass-panel rounded-3xl p-10 border border-white/20 hover:border-[#00FFF0]/50 transition-all duration-500 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-[#00FFF0]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                To democratize AI technology by providing an intuitive, unified platform that empowers anyone to create, innovate, and build extraordinary things—regardless of their technical background or resources.
              </p>
            </div>
          </Floating3DCard>

          <Floating3DCard delay={150}>
            <div className="glass-panel rounded-3xl p-10 border border-white/20 hover:border-[#8A2BE2]/50 transition-all duration-500 h-full">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8A2BE2]/20 to-[#00FFF0]/20 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#8A2BE2]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                A world where every individual and organization can leverage AI to amplify their creativity, accelerate innovation, and solve complex problems—making the impossible, possible.
              </p>
            </div>
          </Floating3DCard>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Our Core Values</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <Floating3DCard key={idx} delay={idx * 100}>
                  <div className="glass-panel rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 h-full group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-white/70 leading-relaxed">{value.description}</p>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Our Journey</h2>
            <p className="text-xl text-white/70">From inception to innovation</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00FFF0] via-[#8A2BE2] to-[#00FFF0] transform -translate-x-1/2" />

            <div className="space-y-16">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                const isLeft = idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <Floating3DCard delay={idx * 100}>
                        <div className="glass-panel rounded-2xl p-6 border border-white/20 hover:border-[#00FFF0]/50 transition-all duration-500">
                          <div className={`inline-flex items-center gap-3 mb-3 ${isLeft ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[#00FFF0]" />
                            </div>
                            <span className="text-2xl font-bold text-[#00FFF0]">{milestone.year}</span>
                          </div>
                          <p className="text-white/80 text-lg">{milestone.event}</p>
                        </div>
                      </Floating3DCard>
                    </div>

                    {/* Center Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] border-4 border-slate-900 z-10" />

                    <div className="w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Meet Our Team</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Passionate innovators dedicated to pushing the boundaries of AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <Floating3DCard key={idx} delay={idx * 100}>
                <div className="glass-panel rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 text-center group">
                  <div className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${member.image} mb-6 group-hover:scale-105 transition-transform duration-300`} />
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-[#00FFF0] text-sm font-semibold mb-4">{member.role}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </Floating3DCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
