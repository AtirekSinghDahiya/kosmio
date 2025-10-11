import React, { useEffect, useState } from 'react';
import { Code, Palette, Video, Volume2, Send, Paperclip, Sparkles } from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';

interface LandingViewProps {
  onQuickAction: (prompt: string) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onQuickAction, selectedModel = 'gpt-4o', onModelChange }) => {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const suggestions = [
    {
      icon: Code,
      title: 'Write Code',
      description: 'Build a React component with TypeScript',
      prompt: 'Help me build a React component',
      gradient: 'from-teal-500/20 to-cyan-500/20',
      borderColor: 'hover:border-[#00FFF0]',
      glowColor: 'hover:shadow-[0_0_30px_rgba(0,255,240,0.3)]'
    },
    {
      icon: Palette,
      title: 'Design UI',
      description: 'Create a modern landing page design',
      prompt: 'Design a modern landing page',
      gradient: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'hover:border-[#8A2BE2]',
      glowColor: 'hover:shadow-[0_0_30px_rgba(138,43,226,0.3)]'
    },
    {
      icon: Video,
      title: 'Video Edit',
      description: 'Edit and enhance your videos',
      prompt: 'Help me edit a video',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'hover:border-blue-400',
      glowColor: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
    },
    {
      icon: Volume2,
      title: 'Generate Voice',
      description: 'Convert text to AI voice speech',
      prompt: 'Generate a voice saying hello world',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'hover:border-emerald-400',
      glowColor: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orbit-ring" style={{ width: '300px', height: '300px', top: '20%', left: '10%' }} />
        <div className="orbit-ring" style={{ width: '450px', height: '450px', top: '40%', right: '5%' }} />
        <div className="orbit-ring" style={{ width: '200px', height: '200px', bottom: '15%', left: '60%' }} />
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className={`text-center space-y-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 shadow-2xl shadow-[#00FFF0]/30 backdrop-blur-xl border-2 border-white/20 p-4 animate-pulse-glow">
            <img
              src="/logo.svg"
              alt="Kosmio"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,240,0.6)]"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Welcome to <span className="animated-gradient-text text-5xl md:text-6xl" data-text="Kosmio">Kosmio</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto font-light">
              Creating at cosmic scale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(suggestion.prompt)}
                className={`group relative glass-panel glass-panel-hover blur-transition rounded-2xl p-4 text-left ${
                  mounted ? 'animate-fade-in-up' : 'opacity-0'
                } stagger-${index + 1} button-press ${suggestion.borderColor} ${suggestion.glowColor}`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-white/10 icon-spin-hover">
                    <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-glow-teal transition-all">
                      {suggestion.title}
                    </h3>
                    <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00FFF0] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </button>
            );
          })}
        </div>

        <div className={`text-center space-y-2 mb-6 ${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/80 text-xs font-medium border border-white/20">
                Enter
              </kbd>
              <span className="text-white/60 text-xs">to send</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/80 text-xs font-medium border border-white/20">
                Shift + Enter
              </kbd>
              <span className="text-white/60 text-xs">for new line</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 pb-6 mt-4">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            onQuickAction(input);
            setInput('');
          }
        }} className={mounted ? 'animate-fade-in-up stagger-5' : 'opacity-0'}>
          <div className="space-y-3">
            {onModelChange && (
              <div className="mb-3">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  category="chat"
                />
              </div>
            )}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      onQuickAction(input);
                      setInput('');
                    }
                  }
                }}
                placeholder="Ask Kosmio anything..."
                className="w-full bg-transparent px-6 py-4 text-white placeholder-white/50 focus:outline-none resize-none min-h-[60px] max-h-[200px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              {attachedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-white/5 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm text-white">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-white/70 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setAttachedFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/70 hover:text-white relative"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                    {attachedFiles.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
                        {attachedFiles.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isEnhancing || !input.trim()}
                    onClick={async () => {
                      if (input.trim() && !isEnhancing) {
                        const originalPrompt = input;
                        setIsEnhancing(true);
                        try {
                          const { enhancePrompt } = await import('../../lib/aiProviders');

                          // Detect context from input
                          const lowerInput = originalPrompt.toLowerCase();
                          let context: 'general' | 'code' | 'design' | 'video' | 'voice' = 'general';

                          if (lowerInput.match(/\b(code|program|function|api|website|app|react|typescript|javascript)\b/)) {
                            context = 'code';
                          } else if (lowerInput.match(/\b(design|logo|ui|ux|interface|mockup|graphic)\b/)) {
                            context = 'design';
                          } else if (lowerInput.match(/\b(video|edit|clip|footage|movie|reel)\b/)) {
                            context = 'video';
                          } else if (lowerInput.match(/\b(voice|speak|audio|narrat|tts|speech)\b/)) {
                            context = 'voice';
                          }

                          const enhanced = await enhancePrompt(originalPrompt, context, selectedModel);
                          setInput(enhanced);
                        } catch (error: any) {
                          console.error('Enhancement error:', error);
                          const message = error.message || 'Failed to enhance prompt. Please check your API keys.';
                          alert(message);
                          setInput(originalPrompt);
                        } finally {
                          setIsEnhancing(false);
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/70 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enhance prompt with AI (context-aware)"
                  >
                    <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                    <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <footer className={`text-center text-white/40 text-xs py-4 ${mounted ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
        <p>Kosmio © 2025 — Crafted with intelligence</p>
      </footer>
    </div>
  );
};
