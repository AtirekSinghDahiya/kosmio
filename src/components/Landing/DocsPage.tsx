import React, { useState } from 'react';
import { Book, MessageSquare, Code, Palette, Zap, Shield, Coins, FileText, HelpCircle } from 'lucide-react';
import { AnimatedGradientOrb, Floating3DCard } from './FloatingElements';

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Book },
    { id: 'pricing', title: 'Pricing & Tokens', icon: Coins },
    { id: 'features', title: 'Platform Features', icon: Zap },
    { id: 'ai-models', title: 'AI Models', icon: MessageSquare },
    { id: 'studios', title: 'Creative Studios', icon: Palette },
    { id: 'security', title: 'Security & Privacy', icon: Shield },
    { id: 'api', title: 'API Reference', icon: Code },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
  ];

  const content: Record<string, any> = {
    'getting-started': {
      title: 'Getting Started with KroniQ',
      sections: [
        {
          heading: 'Welcome to KroniQ AI',
          content: 'KroniQ is your all-in-one AI platform for chat, code, design, video, music, and more. Get started in minutes and unlock the power of advanced AI models.'
        },
        {
          heading: 'Quick Start Guide',
          content: '1. Create your account\n2. Choose your first AI model\n3. Start with 5,000 free tokens daily\n4. Explore all creative studios\n5. Upgrade for premium models'
        },
        {
          heading: 'System Requirements',
          content: 'KroniQ works on any modern browser:\n• Chrome 90+\n• Firefox 88+\n• Safari 14+\n• Edge 90+\n\nNo installation required!'
        }
      ]
    },
    'pricing': {
      title: 'Pricing & Token System',
      sections: [
        {
          heading: 'How It Works',
          content: 'KroniQ uses a transparent token-based pricing:\n\n• 1 USD = 10,000 KroniQ Tokens\n• Pay only for what you use\n• 2x multiplier on all requests\n• Free tier: 5,000 tokens daily'
        },
        {
          heading: 'Token Packs',
          content: 'Starter ($2): 1,000,000 tokens\nPopular ($5): 2,500,000 tokens\nPower User ($10): 5,000,000 tokens\nPro ($20): 10,000,000 tokens\n\nSubscribe monthly and save 10%!'
        },
        {
          heading: 'Usage Examples',
          content: 'Chat Message: 10-300 tokens\nImage Generation: 200-3,000 tokens\nVideo (5s): 5,000-10,000 tokens\nCode Generation: 50-2,000 tokens\nMusic Track: 2,000-5,000 tokens'
        }
      ]
    },
    'features': {
      title: 'Platform Features',
      sections: [
        {
          heading: 'AI Chat',
          content: 'Intelligent conversations with multiple AI models including GPT-4, Claude, and Gemini. Context-aware with conversation memory.'
        },
        {
          heading: 'Image Generation',
          content: 'Create stunning visuals with DALL-E 3, Stable Diffusion, and more. Multiple styles, resolutions, and aspect ratios.'
        },
        {
          heading: 'Video Generation',
          content: 'Generate videos with Sora-2, Runway Gen-3, Kling AI, and Veo-3. Text-to-video and image-to-video capabilities.'
        },
        {
          heading: 'Music Creation',
          content: 'Compose original music with Suno AI. Custom genres, moods, and durations. Royalty-free output.'
        },
        {
          heading: 'Voice Synthesis',
          content: 'Natural text-to-speech with multiple voices, languages, and accents. Emotion and tone control.'
        },
        {
          heading: 'Code Studio',
          content: 'AI-powered coding assistant supporting multiple programming languages. Debug, optimize, and generate code.'
        }
      ]
    },
    'ai-models': {
      title: 'AI Models Available',
      sections: [
        {
          heading: 'Chat Models',
          content: 'GPT-4 Turbo - Most capable general-purpose model\nClaude 3 Opus - Best for complex reasoning\nGemini Pro - Fast and efficient\nAnd many more...'
        },
        {
          heading: 'Image Models',
          content: 'DALL-E 3 - High-quality image generation\nStable Diffusion XL - Artistic and flexible\nMidjourney-style - Premium aesthetics'
        },
        {
          heading: 'Video Models',
          content: 'Sora-2 - Cutting-edge video generation\nRunway Gen-3 - Professional quality\nKling AI - Fast turnaround\nVeo-3 - Latest technology'
        },
        {
          heading: 'Audio Models',
          content: 'Suno AI - Music composition\nElevenLabs - Voice synthesis\nCustom audio processing'
        }
      ]
    },
    'studios': {
      title: 'Creative Studios',
      sections: [
        {
          heading: 'Code Studio',
          content: 'Full-featured development environment with syntax highlighting, multiple language support, and AI-powered suggestions.'
        },
        {
          heading: 'Design Studio',
          content: 'Create logos, UI designs, and visual assets with AI assistance. Export in multiple formats.'
        },
        {
          heading: 'Video Studio',
          content: 'Generate and edit videos with AI. Add effects, transitions, and audio. Export in various resolutions.'
        },
        {
          heading: 'Voice Studio',
          content: 'Text-to-speech, voice cloning, and audio enhancement. Multiple languages and accents available.'
        },
        {
          heading: 'PPT Studio',
          content: 'Create professional presentations with AI-generated slides, layouts, and content.'
        }
      ]
    },
    'security': {
      title: 'Security & Privacy',
      sections: [
        {
          heading: 'Data Protection',
          content: 'All data encrypted in transit and at rest\nHTTPS/TLS encryption\nSecure authentication via Firebase\nRow-level security in database'
        },
        {
          heading: 'Privacy Policy',
          content: 'Your content is yours. We do not:\n• Sell your data\n• Use your content to train models\n• Share with third parties\n• Store more than necessary'
        },
        {
          heading: 'Compliance',
          content: 'GDPR compliant\nCCPA compliant\nSOC 2 standards\nRegular security audits'
        }
      ]
    },
    'api': {
      title: 'API Reference',
      sections: [
        {
          heading: 'Coming Soon',
          content: 'API access for developers is currently in development. Features will include:\n\n• REST API endpoints\n• WebSocket connections\n• SDKs for popular languages\n• Comprehensive documentation\n• Rate limiting and quotas'
        },
        {
          heading: 'Early Access',
          content: 'Interested in API access? Contact us at kroniq.ca@gmail.com for early access information.'
        }
      ]
    },
    'faq': {
      title: 'Frequently Asked Questions',
      sections: [
        {
          heading: 'Do tokens expire?',
          content: 'Free tokens refresh daily (5,000/day). Purchased tokens never expire.'
        },
        {
          heading: 'Can I cancel my subscription?',
          content: 'Yes, cancel anytime. You keep all unused tokens even after cancellation.'
        },
        {
          heading: 'What payment methods do you accept?',
          content: 'We accept all major credit cards via Stripe. Secure and PCI compliant.'
        },
        {
          heading: 'Is there a free trial?',
          content: 'Yes! Everyone gets 5,000 free tokens daily. No credit card required to start.'
        },
        {
          heading: 'Can I use this for commercial projects?',
          content: 'Yes, all content you create is yours to use commercially.'
        },
        {
          heading: 'What if I run out of tokens?',
          content: 'You can purchase more anytime or wait for your daily free tokens to refresh.'
        }
      ]
    }
  };

  const activeContent = content[activeSection];

  return (
    <div className="relative w-full pb-20 min-h-screen">
      <AnimatedGradientOrb className="top-40 right-10 w-96 h-96" />
      <AnimatedGradientOrb className="bottom-40 left-10 w-[500px] h-[500px]" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-6 py-3 glass-panel rounded-full border border-white/20 mb-8">
            <span className="text-[#00FFF0] text-sm font-bold tracking-wider">DOCUMENTATION</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              Get Started
            </span>
          </h1>

          <p className="text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            Comprehensive guides and documentation to help you master KroniQ AI
          </p>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="relative px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="glass-panel rounded-2xl p-6 border border-white/10 sticky top-24">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contents</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 text-white border border-[#00FFF0]/30'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Floating3DCard>
                <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    {activeContent.title}
                  </h2>

                  <div className="space-y-8">
                    {activeContent.sections.map((section: any, idx: number) => (
                      <div key={idx} className="pb-8 border-b border-white/10 last:border-0">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center text-sm text-[#00FFF0] font-bold">
                            {idx + 1}
                          </span>
                          {section.heading}
                        </h3>
                        <div className="text-white/70 leading-relaxed whitespace-pre-line pl-11">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Floating3DCard>

              {/* Help CTA */}
              <div className="mt-8 glass-panel rounded-2xl p-8 border border-[#00FFF0]/30 text-center">
                <FileText className="w-12 h-12 text-[#00FFF0] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Need More Help?</h3>
                <p className="text-white/70 mb-6">
                  Can't find what you're looking for? Our team is here to help.
                </p>
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="px-6 py-3 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
