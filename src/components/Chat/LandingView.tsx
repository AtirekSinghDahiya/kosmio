import React, { useEffect, useState } from 'react';
import { Code, Palette, Video, Volume2, Send, Sparkles, ArrowRight } from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';

interface LandingViewProps {
  onQuickAction: (prompt: string) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onQuickAction, selectedModel = 'gpt-4o', onModelChange }) => {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const suggestions = [
    {
      icon: Code,
      title: 'Write Code',
      prompt: 'Help me build a React component',
    },
    {
      icon: Palette,
      title: 'Design UI',
      prompt: 'Design a modern landing page',
    },
    {
      icon: Video,
      title: 'Video Edit',
      prompt: 'Help me edit a video',
    },
    {
      icon: Volume2,
      title: 'Generate Voice',
      prompt: 'Generate a voice saying hello world',
    }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center">
        {/* Logo and Title */}
        <div className={`text-center mb-12 ${mounted ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img
              src="/logo.svg"
              alt="KroniQ"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Welcome to KroniQ
          </h1>
          <p className="text-white/60 text-sm">
            How can I help you today?
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-8 ${mounted ? 'opacity-100 transition-opacity duration-700 delay-200' : 'opacity-0'}`}>
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(suggestion.prompt)}
                className="group flex flex-col items-start gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left"
              >
                <Icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors font-medium">
                  {suggestion.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Area */}
        <div className={`w-full ${mounted ? 'opacity-100 transition-opacity duration-700 delay-400' : 'opacity-0'}`}>
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
    </div>
  );
};
