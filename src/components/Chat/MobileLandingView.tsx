import React, { useState } from 'react';
import { Image, Lightbulb, FileText, Globe, BookOpen, Plus, Mic, Send, Camera, ImageIcon, Paperclip, X } from 'lucide-react';

interface MobileLandingViewProps {
  onQuickAction: (prompt: string) => void;
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
}

export const MobileLandingView: React.FC<MobileLandingViewProps> = ({
  onQuickAction,
  input,
  setInput,
  onSendMessage
}) => {
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const suggestions = [
    {
      icon: Image,
      title: 'Create image',
      description: 'Visualize anything',
      prompt: 'Create an image of',
      color: 'text-emerald-400'
    },
    {
      icon: Lightbulb,
      title: 'Thinking',
      description: 'Think longer for better answers',
      prompt: 'Think deeply about',
      color: 'text-yellow-400'
    },
    {
      icon: FileText,
      title: 'Deep research',
      description: 'Get a detailed report',
      prompt: 'Research and give me a detailed report on',
      color: 'text-blue-400'
    },
    {
      icon: Globe,
      title: 'Web search',
      description: 'Find real-time news and info',
      prompt: 'Search the web for',
      color: 'text-cyan-400'
    },
    {
      icon: BookOpen,
      title: 'Study and learn',
      description: 'Learn a new concept',
      prompt: 'Teach me about',
      color: 'text-purple-400'
    }
  ];

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    onQuickAction(suggestion.prompt);
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        <h1 className="text-3xl font-normal text-white/90 mb-12 text-center">
          What can I help with?
        </h1>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-md">
          {suggestions.slice(0, 3).map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
              >
                <Icon className={`w-4 h-4 ${suggestion.color}`} />
                <span className="text-sm text-white/80">{suggestion.title}</span>
              </button>
            );
          })}
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
          >
            <span className="text-sm text-white/80">More</span>
          </button>
        </div>

        {/* More Suggestions - List Style */}
        <div className="mt-8 w-full max-w-md space-y-2">
          {suggestions.slice(3).map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-all active:scale-[0.98] text-left"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-5 h-5 ${suggestion.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/90">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {suggestion.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Input Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 p-4 safe-bottom">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          {/* Plus Button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-full transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 text-white/80" />
          </button>

          {/* Input Container */}
          <div className="flex-1 flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl px-4 py-2 min-h-[44px]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask Kroniq"
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-[15px] py-1"
            />
            <button className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-all active:scale-95">
              <Mic className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-white disabled:bg-white/20 rounded-full transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-black disabled:text-white/40" />
          </button>
        </div>

        {/* Attachment Menu */}
        {showAttachMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
              onClick={() => setShowAttachMenu(false)}
            />

            {/* Menu */}
            <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 animate-slide-up">
              {/* Attach Options */}
              <div className="grid grid-cols-3 gap-2 mb-3 p-2">
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <Camera className="w-8 h-8 text-white/80" />
                  <span className="text-sm text-white/70">Camera</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <ImageIcon className="w-8 h-8 text-white/80" />
                  <span className="text-sm text-white/70">Photos</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <Paperclip className="w-8 h-8 text-white/80" />
                  <span className="text-sm text-white/70">Files</span>
                </button>
              </div>

              {/* Explore Tools Button */}
              <button
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-[0.98]"
                onClick={() => setShowAttachMenu(false)}
              >
                <span className="text-sm text-white/70">Explore tools</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
