import React, { useState } from 'react';
import {
  Code,
  Globe,
  Smartphone,
  Database,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  Search,
  MapPin,
  FileText,
  Bot,
  Camera,
  Mic,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';

interface CodeStudioGalleryProps {
  onSelectTemplate: (template: AppTemplate) => void;
  onBack?: () => void;
}

export interface AppTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  features: string[];
}

export const CodeStudioGallery: React.FC<CodeStudioGalleryProps> = ({ onSelectTemplate, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const appTemplates: AppTemplate[] = [
    {
      id: 'photo-editor',
      title: 'AI Photo Editor',
      description: 'Add powerful photo editing to your app. Allow users to add objects, remove backgrounds, or change a photo\'s style just by typing.',
      icon: ImageIcon,
      category: 'media',
      features: ['Object manipulation', 'Background removal', 'Style transfer', 'Auto-enhancement']
    },
    {
      id: 'voice-app',
      title: 'Conversational Voice Apps',
      description: 'Use the Gemini Live API to give your app a voice and make your own conversational experiences.',
      icon: Mic,
      category: 'communication',
      features: ['Real-time speech', 'Natural conversations', 'Voice commands', 'Multi-language']
    },
    {
      id: 'video-animator',
      title: 'Video Animation Studio',
      description: 'Bring images to life with Veo 3. Let users upload a product photo and turn it into a dynamic video ad, or animate a character\'s portrait.',
      icon: Video,
      category: 'media',
      features: ['Image-to-video', 'Character animation', 'Product videos', 'Dynamic ads']
    },
    {
      id: 'search-agent',
      title: 'AI Search Agent',
      description: 'Connect your app to real-time Google Search results. Build an agent that can discuss current events, cite recent news, or fact-check information.',
      icon: Search,
      category: 'productivity',
      features: ['Real-time search', 'Fact checking', 'Source citation', 'News integration']
    },
    {
      id: 'maps-assistant',
      title: 'Location Intelligence',
      description: 'Connect your app to real-time Google Maps data. Build an agent that can pull information about places, routes, or directions.',
      icon: MapPin,
      category: 'location',
      features: ['Place search', 'Route planning', 'Location data', 'Real-time updates']
    },
    {
      id: 'image-generator',
      title: 'AI Image Generation',
      description: 'Generate high-quality images from a text prompt. Create blog post heroes, concept art, or unique assets for your application.',
      icon: Camera,
      category: 'media',
      features: ['Text-to-image', 'Style control', 'High resolution', 'Batch generation']
    },
    {
      id: 'chatbot',
      title: 'Context-Aware Chatbot',
      description: 'Add a context-aware chatbot to your app. Give your users a conversational agent that remembers the conversation, perfect for multi-step bookings or troubleshooting.',
      icon: Bot,
      category: 'communication',
      features: ['Memory retention', 'Multi-turn dialog', 'Context understanding', 'Custom personality']
    },
    {
      id: 'document-analyzer',
      title: 'Document Analysis',
      description: 'Enable your app to see and understand documents. Analyze images, extract text, or answer questions about visual content.',
      icon: FileText,
      category: 'productivity',
      features: ['OCR extraction', 'Visual QA', 'Document parsing', 'Data extraction']
    },
    {
      id: 'music-generator',
      title: 'AI Music Studio',
      description: 'Create original music and soundtracks. Generate background music, jingles, or complete songs based on mood and style preferences.',
      icon: Music,
      category: 'media',
      features: ['Music generation', 'Style selection', 'Mood-based', 'Royalty-free']
    },
    {
      id: 'aspect-control',
      title: 'Smart Image Resizing',
      description: 'Control the exact shape of your generated images. Build an app that creates visuals optimized for different platforms and formats.',
      icon: TrendingUp,
      category: 'media',
      features: ['Aspect ratio control', 'Platform optimization', 'Batch processing', 'Quality preservation']
    },
    {
      id: 'code-assistant',
      title: 'AI Code Assistant',
      description: 'Embed Gemini in your app to complete all sorts of tasks - analyze content, make edits, and more.',
      icon: Code,
      category: 'development',
      features: ['Code generation', 'Bug fixing', 'Refactoring', 'Documentation']
    },
    {
      id: 'web-builder',
      title: 'Website Builder',
      description: 'Build complete responsive websites with AI. Create landing pages, portfolios, or business sites with natural language.',
      icon: Globe,
      category: 'development',
      features: ['Responsive design', 'Component library', 'Theme customization', 'SEO optimization']
    },
  ];

  const filteredTemplates = searchQuery
    ? appTemplates.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : appTemplates;

  const categories = Array.from(new Set(appTemplates.map(t => t.category)));

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-normal text-white">
                Build your ideas with AI
              </h1>
              <p className="text-gray-400 mt-1">
                Choose a template to get started
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-medium text-white mb-6">
            Supercharge your apps with AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="group flex flex-col p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left"
                >
                  {/* Icon and Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {template.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No templates found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
