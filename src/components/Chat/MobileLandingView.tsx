import React, { useState } from 'react';
import { Image, Lightbulb, FileText, Globe, BookOpen, Plus, Mic, Send, Camera, ImageIcon, Paperclip, X, Menu, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { userData, signOut } = useAuth();
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
      title: 'Analyze data',
      description: 'Understand information',
      prompt: 'Analyze the following data:',
      color: 'text-cyan-400'
    },
    {
      icon: FileText,
      title: 'Summarize text',
      description: 'Get key points',
      prompt: 'Summarize this text:',
      color: 'text-orange-400'
    },
    {
      icon: Globe,
      title: 'Web search',
      description: 'Find real-time news and info',
      prompt: 'Search the web for',
      color: 'text-blue-400'
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
    <div className="h-full flex flex-col relative">
      {/* Cosmic Background (original theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orbit-ring" style={{ width: '300px', height: '300px', top: '20%', left: '10%' }} />
        <div className="orbit-ring" style={{ width: '450px', height: '450px', top: '40%', right: '5%' }} />
        <div className="orbit-ring" style={{ width: '200px', height: '200px', bottom: '15%', left: '60%' }} />
      </div>

      {/* Mobile Header with Hamburger and Scan buttons */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 safe-top">
        <button
          onClick={() => setShowSidebar(true)}
          className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 backdrop-blur-xl rounded-full transition-all active:scale-95 border border-white/10"
        >
          <Menu className="w-5 h-5 text-white/90" />
        </button>

        <button className="px-5 py-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 rounded-full text-white text-sm font-medium transition-all active:scale-95 shadow-lg border border-white/20">
          Get Plus
        </button>

        <button className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/15 backdrop-blur-xl rounded-full transition-all active:scale-95 border border-white/10">
          <Camera className="w-5 h-5 text-white/90" />
        </button>
      </div>

      {/* Sidebar Drawer */}
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-80 glass-panel border-r border-white/10 z-50 animate-slide-in-left overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white/90">Menu</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {userData && (
                <div className="mb-6 p-4 glass-panel rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">
                        {userData.email}
                      </div>
                      <div className="text-xs text-white/50">
                        Free Plan
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left">
                  <MessageSquare className="w-5 h-5 text-white/70" />
                  <span className="text-sm text-white/90">Chat History</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-left">
                  <User className="w-5 h-5 text-white/70" />
                  <span className="text-sm text-white/90">Profile & Settings</span>
                </button>
                {userData && (
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 rounded-xl transition-all text-left mt-6"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 pt-20 relative z-10">
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
                className="flex items-center gap-2 px-4 py-2.5 glass-panel hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
              >
                <Icon className={`w-4 h-4 ${suggestion.color}`} />
                <span className="text-sm text-white/80">{suggestion.title}</span>
              </button>
            );
          })}
          <button
            className="flex items-center gap-2 px-4 py-2.5 glass-panel hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
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

      {/* Bottom Input Bar - Fixed (ChatGPT Style) */}
      <div className="fixed bottom-0 left-0 right-0 glass-panel backdrop-blur-2xl border-t border-white/10 p-3 safe-bottom z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {/* Plus Button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-full transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 text-white/80" />
          </button>

          {/* Input Container */}
          <div className="flex-1 bg-white/10 border border-white/20 rounded-[26px] px-4 py-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask ChatGPT"
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-[15px]"
            />
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                <Mic className="w-5 h-5 text-white/60" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-1.5 rounded-lg transition-all ${
                  input.trim()
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
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
            <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto glass-panel border border-white/10 rounded-2xl p-3 animate-slide-up">
              {/* Attach Options */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <Camera className="w-7 h-7 text-white/80" />
                  <span className="text-xs text-white/70">Camera</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <ImageIcon className="w-7 h-7 text-white/80" />
                  <span className="text-xs text-white/70">Photos</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                  <Paperclip className="w-7 h-7 text-white/80" />
                  <span className="text-xs text-white/70">Files</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
