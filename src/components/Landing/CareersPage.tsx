import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, Heart, Zap, Target } from 'lucide-react';
import { Floating3DCard, AnimatedGradientOrb } from './FloatingElements';

export const CareersPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const positions = [
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$8,000 - $12,000',
      description: 'Polish UI/UX, animations, and responsiveness across all platforms',
      requirements: [
        'Expert in React, TypeScript, and modern CSS',
        'Experience with animation libraries and responsive design',
        'Strong eye for detail and user experience',
        'Portfolio showcasing UI/UX work'
      ]
    },
    {
      title: 'Backend Developer (Firebase/Node)',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$9,000 - $13,000',
      description: 'Optimize APIs, handle scaling, and maintain backend infrastructure',
      requirements: [
        'Strong experience with Node.js and Firebase',
        'Database optimization and scaling expertise',
        'API design and microservices architecture',
        'Experience with cloud platforms (GCP, AWS)'
      ]
    },
    {
      title: 'AI Engineer / ML Developer',
      department: 'AI & ML',
      location: 'Remote',
      type: 'Full-time',
      salary: '$10,000 - $15,000',
      description: 'Improve model integrations, optimize tokens, and build custom LLM pipelines',
      requirements: [
        'Deep understanding of LLMs and AI models',
        'Experience with model optimization and fine-tuning',
        'Strong Python and ML framework knowledge',
        'Experience integrating various AI APIs'
      ]
    },
    {
      title: 'Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$10,000 - $14,000',
      description: 'Unify backend + frontend updates across the entire platform',
      requirements: [
        'Full-stack development experience',
        'Proficient in React, Node.js, and databases',
        'Strong problem-solving and architecture skills',
        'Experience with agile development'
      ]
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$7,000 - $11,000',
      description: 'Create premium branding, design flows, and enhance user experience',
      requirements: [
        'Strong portfolio of UI/UX work',
        'Expert in Figma, Adobe Creative Suite',
        'Understanding of design systems',
        'Experience with user research and testing'
      ]
    },
    {
      title: 'QA Tester',
      department: 'Quality',
      location: 'Remote',
      type: 'Part-time',
      salary: '$5,000 - $8,000',
      description: 'Catch bugs before launch and ensure quality across all features',
      requirements: [
        'Experience with manual and automated testing',
        'Detail-oriented with strong documentation skills',
        'Familiarity with testing frameworks',
        'Ability to reproduce and report bugs effectively'
      ]
    },
    {
      title: 'Marketing Strategist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      salary: '$7,000 - $11,000',
      description: 'Handle launch, social media, SEO, and partnerships',
      requirements: [
        'Proven marketing campaign experience',
        'SEO and content marketing expertise',
        'Strong social media management skills',
        'Data-driven approach to growth'
      ]
    },
    {
      title: 'Community Manager',
      department: 'Community',
      location: 'Remote',
      type: 'Full-time',
      salary: '$6,000 - $9,000',
      description: 'Engage users, collect feedback, and build brand loyalty',
      requirements: [
        'Excellent communication skills',
        'Experience managing online communities',
        'Passion for user engagement',
        'Ability to handle feedback and criticism constructively'
      ]
    },
    {
      title: 'Customer Support Lead',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      salary: '$6,000 - $9,000',
      description: 'Handle helpdesk, user onboarding, and issue tracking',
      requirements: [
        'Customer service experience',
        'Technical troubleshooting skills',
        'Excellent written and verbal communication',
        'Experience with support ticketing systems'
      ]
    },
    {
      title: 'Finance & Operations Manager',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time',
      salary: '$8,000 - $12,000',
      description: 'Handle transactions, cost tracking, and pricing optimizations',
      requirements: [
        'Financial management experience',
        'Understanding of SaaS business models',
        'Data analysis and reporting skills',
        'Experience with financial software and tools'
      ]
    }
  ];

  const benefits = [
    { icon: MapPin, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health benefits' },
    { icon: Zap, title: 'Growth', description: 'Learning and development budget' },
    { icon: Users, title: 'Great Team', description: 'Collaborate with talented people' },
    { icon: Target, title: 'Impact', description: 'Build products used by thousands' },
    { icon: Clock, title: 'Flexibility', description: 'Flexible working hours' }
  ];

  return (
    <div className="relative w-full pb-20">
      <AnimatedGradientOrb className="top-40 right-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 left-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className={`relative pt-40 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8">
            <span className="text-[#00FFF0] text-sm font-bold tracking-wider">JOIN OUR TEAM</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Build the Future of{' '}
            <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              AI Creativity
            </span>
          </h1>

          <p className="text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            We're looking for talented individuals to help shape the next generation of AI-powered creative tools
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Join KroniQ?
            </h2>
            <p className="text-lg text-white/60">
              We offer more than just a job - join a mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Floating3DCard key={idx} delay={idx * 100}>
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-[#00FFF0]/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00FFF0]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/60 text-sm">{benefit.description}</p>
                  </div>
                </Floating3DCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="relative px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
                Open Positions
              </span>
            </h2>
            <p className="text-lg text-white/60">
              {positions.length} openings across multiple departments
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((position, idx) => (
              <Floating3DCard key={idx} delay={idx * 50}>
                <div className="glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#00FFF0]/30 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-7 h-7 text-[#00FFF0]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">{position.title}</h3>
                          <p className="text-white/70 mb-4">{position.description}</p>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1 glass-panel rounded-full border border-white/10">
                              <Briefcase className="w-4 h-4 text-[#00FFF0]" />
                              <span className="text-sm text-white/80">{position.department}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 glass-panel rounded-full border border-white/10">
                              <MapPin className="w-4 h-4 text-[#00FFF0]" />
                              <span className="text-sm text-white/80">{position.location}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 glass-panel rounded-full border border-white/10">
                              <Clock className="w-4 h-4 text-[#00FFF0]" />
                              <span className="text-sm text-white/80">{position.type}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 glass-panel rounded-full border border-green-500/30 bg-green-500/10">
                              <DollarSign className="w-4 h-4 text-green-300" />
                              <span className="text-sm text-green-300 font-semibold">{position.salary}/mo</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white/80">Requirements:</h4>
                            <ul className="space-y-1">
                              {position.requirements.map((req, rIdx) => (
                                <li key={rIdx} className="text-sm text-white/60 flex items-start gap-2">
                                  <span className="text-[#00FFF0] mt-1">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="px-6 py-3 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </div>
              </Floating3DCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-12 border border-[#00FFF0]/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FFF0]/10 to-[#8A2BE2]/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Don't See Your Role?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                We're always looking for talented people. Send us your resume and let's talk!
              </p>
              <button
                onClick={() => window.location.href = '/contact'}
                className="px-8 py-4 glass-panel border border-white/20 text-white rounded-xl font-bold text-lg hover:border-[#00FFF0]/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
