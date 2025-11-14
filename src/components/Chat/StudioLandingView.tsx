import React, { useState } from 'react';
import { Sparkles, Image, Video, Music, Code, Mic, MessageSquare, Zap, FileCode, Presentation } from 'lucide-react';

interface StudioLandingViewProps {
  onSelectMode: (mode: string, modelId?: string) => void;
}

type Tab = 'featured' | 'chat' | 'images' | 'video' | 'audio' | 'code';

interface ModelCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  badge?: string;
}

export const StudioLandingView: React.FC<StudioLandingViewProps> = ({ onSelectMode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('featured');

  const tabs = [
    { id: 'featured' as Tab, label: 'Featured', icon: Sparkles },
    { id: 'chat' as Tab, label: 'Chat', icon: MessageSquare },
    { id: 'images' as Tab, label: 'Images', icon: Image },
    { id: 'video' as Tab, label: 'Video', icon: Video },
    { id: 'audio' as Tab, label: 'Audio', icon: Music },
    { id: 'code' as Tab, label: 'Code', icon: Code },
  ];

  const modelCards: Record<Tab, ModelCard[]> = {
    featured: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable GPT-4 model with vision, optimized for chat and complex tasks',
        icon: Zap,
        category: 'chat',
        badge: 'Recommended'
      },
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Latest Anthropic model with superior reasoning and coding capabilities',
        icon: Code,
        category: 'chat',
        badge: 'New'
      },
      {
        id: 'flux-1.1-pro',
        name: 'Flux 1.1 Pro',
        description: 'State-of-the-art image generation with photorealistic results',
        icon: Image,
        category: 'image'
      },
      {
        id: 'sora',
        name: 'Sora (OpenAI)',
        description: 'Revolutionary AI video generation from text prompts',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
    ],
    chat: [
      // OpenAI Models
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'OpenAI - Most capable model with vision and complex reasoning',
        icon: MessageSquare,
        category: 'chat',
        badge: 'OpenAI'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'OpenAI - Fast and affordable GPT-4 level intelligence',
        icon: MessageSquare,
        category: 'chat',
        badge: 'OpenAI'
      },
      {
        id: 'o1-preview',
        name: 'o1 Preview',
        description: 'OpenAI - Advanced reasoning model for complex problems',
        icon: MessageSquare,
        category: 'chat',
        badge: 'OpenAI'
      },
      {
        id: 'o1-mini',
        name: 'o1 Mini',
        description: 'OpenAI - Reasoning model optimized for STEM',
        icon: MessageSquare,
        category: 'chat',
        badge: 'OpenAI'
      },
      // Anthropic Models
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Anthropic - Superior reasoning and coding capabilities',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Anthropic'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Anthropic - Most intelligent model for complex tasks',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Anthropic'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Anthropic - Fast and cost-effective responses',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Anthropic'
      },
      // Google Models
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: 'Google - Experimental model with multimodal capabilities',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Google'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Google - Long context window up to 2M tokens',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Google'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Google - Fast and efficient multimodal model',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Google'
      },
      // xAI Models
      {
        id: 'grok-2',
        name: 'Grok 2',
        description: 'xAI - Real-time knowledge and conversational AI',
        icon: MessageSquare,
        category: 'chat',
        badge: 'xAI'
      },
      {
        id: 'grok-2-vision',
        name: 'Grok 2 Vision',
        description: 'xAI - Vision-enabled conversational model',
        icon: MessageSquare,
        category: 'chat',
        badge: 'xAI'
      },
      // Meta Models
      {
        id: 'llama-3.3-70b',
        name: 'Llama 3.3 70B',
        description: 'Meta - Open-source model with strong performance',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Meta'
      },
      {
        id: 'llama-3.1-405b',
        name: 'Llama 3.1 405B',
        description: 'Meta - Largest Llama model with exceptional capabilities',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Meta'
      },
      // Mistral Models
      {
        id: 'mistral-large',
        name: 'Mistral Large',
        description: 'Mistral - High-performance European AI model',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Mistral'
      },
      {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        description: 'Mistral - Efficient mixture of experts model',
        icon: MessageSquare,
        category: 'chat',
        badge: 'Mistral'
      },
    ],
    images: [
      {
        id: 'flux-1.1-pro',
        name: 'Flux 1.1 Pro',
        description: 'Professional-grade image generation with stunning quality',
        icon: Image,
        category: 'image'
      },
      {
        id: 'dalle-3',
        name: 'DALL-E 3',
        description: 'OpenAI\'s image generation with precise prompt following',
        icon: Image,
        category: 'image'
      },
      {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'Artistic image generation with unique visual style',
        icon: Image,
        category: 'image'
      },
      {
        id: 'stable-diffusion',
        name: 'Stable Diffusion XL',
        description: 'Open-source image generation with customization',
        icon: Image,
        category: 'image'
      },
    ],
    video: [
      {
        id: 'sora',
        name: 'Sora (OpenAI)',
        description: 'Generate realistic videos up to 1 minute from text',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
      {
        id: 'runway-gen3',
        name: 'Runway Gen-3',
        description: 'High-quality video generation and editing',
        icon: Video,
        category: 'video'
      },
      {
        id: 'pika',
        name: 'Pika Labs',
        description: 'Create and edit videos with AI',
        icon: Video,
        category: 'video'
      },
      {
        id: 'heygen',
        name: 'HeyGen',
        description: 'AI avatar videos with natural speech',
        icon: Video,
        category: 'video'
      },
    ],
    audio: [
      {
        id: 'suno',
        name: 'Suno AI',
        description: 'Generate complete songs with vocals and instruments',
        icon: Music,
        category: 'audio'
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'Professional voice synthesis and cloning',
        icon: Mic,
        category: 'audio'
      },
      {
        id: 'udio',
        name: 'Udio',
        description: 'Create music in any style with AI',
        icon: Music,
        category: 'audio'
      },
    ],
    code: [
      {
        id: 'code-studio',
        name: 'Code Studio',
        description: 'Build complete applications with AI assistance',
        icon: FileCode,
        category: 'code'
      },
      {
        id: 'web-builder',
        name: 'Web Builder',
        description: 'Create responsive websites with natural language',
        icon: Code,
        category: 'code'
      },
      {
        id: 'api-generator',
        name: 'API Generator',
        description: 'Generate REST APIs and backend services',
        icon: Zap,
        category: 'code'
      },
      {
        id: 'ppt-studio',
        name: 'Presentation Studio',
        description: 'Create beautiful presentations automatically',
        icon: Presentation,
        category: 'code'
      },
    ],
  };

  const handleCardClick = (card: ModelCard) => {
    // Pass both category and model ID for chat models
    if (card.category === 'chat') {
      onSelectMode('chat', card.id);
    } else {
      onSelectMode(card.category, card.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black justify-center">
      <div className="flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center pb-8">
          <h1 className="text-5xl font-normal text-white mb-4">
            KroniQ AI Studio
          </h1>
          <p className="text-gray-400 text-lg">
            Create anything with AI
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 px-4 pb-6 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelCards[activeTab].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="group relative flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 p-3 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-white group-hover:text-white transition-colors">
                        {card.name}
                      </h3>
                      {card.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
