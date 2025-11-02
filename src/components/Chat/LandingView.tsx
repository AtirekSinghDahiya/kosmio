import React, { useEffect, useState } from 'react';
import { ImageIcon, Video, Send, Sparkles, ArrowRight, Presentation, Music } from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';
import { useTheme } from '../../contexts/ThemeContext';

interface LandingViewProps {
  onQuickAction: (prompt: string) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onQuickAction, selectedModel = 'gpt-4o', onModelChange }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const suggestions = [
    {
      icon: ImageIcon,
      title: 'Generate Image',
      prompt: 'Create an image of a sunset over mountains',
    },
    {
      icon: Video,
      title: 'Generate Video',
      prompt: 'Generate a video of ocean waves',
    },
    {
      icon: Presentation,
      title: 'Create PPT',
      prompt: 'Create a presentation about AI',
    },
    {
      icon: Music,
      title: 'Generate Song',
      prompt: 'Create a calm instrumental music',
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto">
        {/* Logo and Title */}
        <div className={`text-center mb-8 md:mb-12 ${mounted ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}`}>
          <img
            src="/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png"
            alt="KroniQ"
            className="h-48 sm:h-56 md:h-64 lg:h-72 w-auto object-contain mb-3 mx-auto drop-shadow-[0_0_20px_rgba(0,255,240,0.5)]"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-3">
            Welcome to KroniQ
          </h1>
          <p className="text-white/60 text-sm md:text-base">
            How can I help you today?
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full ${mounted ? 'opacity-100 transition-opacity duration-700 delay-200' : 'opacity-0'}`}>
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(suggestion.prompt)}
                className="group flex flex-col items-start gap-2 md:gap-3 p-3 md:p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200 text-left active:scale-95"
              >
                <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <span className="text-xs md:text-sm text-white/90 group-hover:text-white transition-colors font-medium leading-snug">
                  {suggestion.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className={`w-full max-w-4xl mx-auto mt-auto ${mounted ? 'opacity-100 transition-opacity duration-700 delay-400' : 'opacity-0'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                onQuickAction(input);
                setInput('');
              }
            }}
            className="relative"
          >
            {onModelChange && (
              <div className="mb-3">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  category="chat"
                />
              </div>
            )}

            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors focus-within:border-white/30">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message KroniQ..."
                className="flex-1 bg-transparent px-5 py-4 text-white text-sm placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="mr-3 p-2 bg-white text-slate-900 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/30 text-center mt-3">
              KroniQ can make mistakes. Check important info.
            </p>
          </form>
        </div>
    </div>
  );
};
