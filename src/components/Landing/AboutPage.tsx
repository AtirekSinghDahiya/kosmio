import React, { useState, useEffect } from 'react';
import { Target, Heart, Users, Zap, Code2, Brain, Briefcase, Lightbulb, Rocket } from 'lucide-react';
import { AnimatedGradientOrb } from './FloatingElements';

export const AboutPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const team = [
    {
      name: 'Atirek Singh',
      role: 'CTO & Founder',
      department: 'Design and Implementation',
      bio: 'The visionary founder who conceived Kosmio in grade 9. Atirek brought together his father and friend to transform his idea into reality, leading the design and technical implementation.',
      icon: Code2,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'Jitender Singh Dahiya',
      role: 'CEO & Co-Founder',
      department: 'Business & Marketing',
      bio: 'Father of Atirek and the strategic mind behind Kosmio. As CEO, he leads all business operations, marketing initiatives, and drives the company\'s growth strategy.',
      icon: Briefcase,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Aditya Narayan Uniyal',
      role: 'Co-CTO & Co-Founder',
      department: 'AI Systems & Backend',
      bio: 'Atirek\'s classmate and friend from grade 9. Aditya built the sophisticated AI systems and robust backend infrastructure that powers Kosmio alongside Atirek.',
      icon: Brain,
      gradient: 'from-indigo-500 to-purple-600'
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Pushing the boundaries of AI technology to create tools that empower creators worldwide.'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Every feature is designed with our users in mind, ensuring intuitive and powerful experiences.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Built by a team that values partnership, creativity, and shared vision for the future.'
    },
    {
      icon: Rocket,
      title: 'Rapid Growth',
      description: 'From a grade 9 idea to a platform serving thousands of creators globally.'
    }
  ];

  return (
    <div className="relative w-full pb-20">
      <AnimatedGradientOrb className="top-40 right-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 left-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full mb-8 border border-white/10">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">About Kosmio</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Building the Future of{' '}
            <span className="text-gradient">AI-Powered Creation</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-light">
            Born from a vision in grade 9, Kosmio has grown into a platform that empowers creators with cutting-edge AI tools. Our journey is a testament to young innovation and collaborative spirit.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel-strong rounded-2xl p-8 md:p-12 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              Kosmio began with a spark of inspiration when <strong className="text-white">Atirek Singh</strong>,
              then in grade 9, envisioned a platform that would democratize access to AI technology.
              Understanding the power of collaboration, he brought together his father, <strong className="text-white">Jitender Singh Dahiya</strong>,
              and his classmate and friend, <strong className="text-white">Aditya Narayan Uniyal</strong>.
              Together, this trio of co-founders combined their unique strengths—technical innovation, business acumen,
              and AI expertise—to build Kosmio from the ground up.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-slate-300">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-6 card-hover border border-white/5"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-10 h-10 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet the Founders</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Three visionaries who came together to make AI accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map((member, idx) => {
              const Icon = member.icon;
              return (
                <div
                  key={idx}
                  className="group glass-panel rounded-3xl p-8 card-hover border border-white/5 hover:border-white/20 transition-all"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} opacity-90 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <div className="text-cyan-400 font-semibold text-sm mb-1">{member.role}</div>
                    <div className="text-slate-400 text-sm">{member.department}</div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-center text-sm">
                    {member.bio}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel-strong rounded-3xl p-12 md:p-16 text-center border border-white/10">
            <Target className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              To empower creators, developers, and businesses worldwide with accessible, powerful AI tools
              that transform ideas into reality. We believe that innovation knows no age, and that the future
              of technology is built by those brave enough to dream big and work together.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
