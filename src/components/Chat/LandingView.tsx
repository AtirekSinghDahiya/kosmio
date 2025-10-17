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
    <div className="h-full flex flex-col items-center justify-start p-3 md:p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orbit-ring" style={{ width: '300px', height: '300px', top: '20%', left: '10%' }} />
        <div className="orbit-ring" style={{ width: '450px', height: '450px', top: '40%', right: '5%' }} />
        <div className="orbit-ring" style={{ width: '200px', height: '200px', bottom: '15%', left: '60%' }} />
      </div>

      <div className="max-w-4xl w-full flex flex-col relative z-10 pt-16 md:pt-4">
        {/* Header - Hidden on mobile to save space */}
        <div className={`hidden md:block text-center space-y-2 mb-3 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 shadow-2xl shadow-[#00FFF0]/30 backdrop-blur-xl border-2 border-white/20 p-2 md:p-3 animate-pulse-glow">
            <img
              src="/logo.svg"
              alt="Kroniq"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,240,0.6)]"
            />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome to <span className="animated-gradient-text text-3xl md:text-4xl" data-text="Kroniq">Kroniq</span>
            </h1>
            <p className="text-[10px] md:text-xs text-white/70 max-w-2xl mx-auto font-light">
              Creating at cosmic scale
            </p>
          </div>
        </div>

        {/* Mobile: Input First (at top), Cards Below */}
        {/* Desktop: Normal order - Cards then Input */}
        <div className="flex flex-col-reverse md:flex-col">
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 md:mb-3">
            {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <div
                key={index}
                className={`floating-card-wrapper ${
                  mounted ? '' : 'opacity-0'
                } stagger-${index + 1}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <button
                  onClick={() => onQuickAction(suggestion.prompt)}
                  className="floating-card-inner w-full group relative overflow-hidden rounded-xl p-4 md:p-3 text-left transition-all duration-500 active:scale-95 touch-manipulation"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minHeight: '80px',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(0,255,240,0.4), transparent 70%)',
                    }}
                  />

                  <div className="relative z-10 space-y-2 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,255,240,0.2), rgba(138,43,226,0.2))',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 8px 32px rgba(0,255,240,0.1)',
                        }}
                      >
                        <Icon className="w-6 h-6 md:w-5 md:h-5 text-white drop-shadow-2xl" />
                      </div>

                      <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg md:text-base font-bold text-white group-hover:translate-x-1 transition-transform duration-500"
                        style={{
                          textShadow: '0 2px 10px rgba(0,255,240,0.3)',
                        }}
                      >
                        {suggestion.title}
                      </h3>
                      <p className="text-sm md:text-xs text-white/70 group-hover:text-white/90 leading-relaxed transition-colors duration-500">
                        {suggestion.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-cyan-400/80 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Click to start</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                    style={{
                      background: 'radial-gradient(circle, rgba(0,255,240,0.4), transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                  />
                </button>
              </div>
            );
          })}
          </div>

          {/* Input Section - Shows first on mobile */}
          <div className="space-y-2">
            <div className={`hidden md:flex text-center space-y-1 mb-2 justify-center ${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 text-[10px] font-medium border border-white/20">
                Enter
              </kbd>
              <span className="text-white/60 text-[10px]">to send</span>
            </div>
            <div className="w-px h-2 bg-white/20" />
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 text-[10px] font-medium border border-white/20">
                Shift + Enter
              </kbd>
              <span className="text-white/60 text-[10px]">for new line</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-3 pb-3 mt-1">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            onQuickAction(input);
            setInput('');
          }
        }} className={mounted ? 'animate-fade-in-up stagger-5' : 'opacity-0'}>
          <div className="space-y-2">
            {onModelChange && (
              <div className="mb-2">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  category="chat"
                />
              </div>
            )}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
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
                placeholder="Ask Kroniq anything..."
                className="w-full bg-transparent px-4 py-3 text-white text-sm placeholder-white/50 focus:outline-none resize-none min-h-[50px] max-h-[150px]"
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
        </div>
      </div>

      <footer className={`text-center text-white/40 text-xs py-4 ${mounted ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
        <p>Kroniq © 2025 — Crafted with intelligence</p>
      </footer>
    </div>
  );
};
