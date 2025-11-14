import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  RefreshCw,
  Code2,
  Eye,
  Maximize2,
  Send,
  Sparkles,
  ChevronRight,
  Lightbulb,
  FileCode,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOpenRouterResponse } from '../../lib/openRouterService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

interface TutorialCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const CodeStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'fullscreen'>('preview');
  const [showSettings, setShowSettings] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [systemInstructions, setSystemInstructions] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tutorialCards: TutorialCard[] = [
    {
      id: 'version-control',
      title: 'Implement version control',
      description: 'Allow users to save different versions of their generated code and revert to previous states if needed.',
      icon: <RefreshCw className="w-6 h-6 text-blue-400" />
    },
    {
      id: 'custom-instructions',
      title: 'Use Custom Instructions',
      description: 'Save custom instructions to define app styles, frameworks, or other preferences to ensure Gemini builds exactly what you have in mind.',
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />
    },
    {
      id: 'api-integration',
      title: 'Integrate external APIs',
      description: 'Connect your application with external services and APIs to extend functionality and add dynamic data.',
      icon: <Zap className="w-6 h-6 text-purple-400" />
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await getOpenRouterResponse(
        [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        selectedModel,
        currentUser?.uid || 'anonymous'
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to start</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-white/90">Code assistant</span>
          </div>

          {messages.length === 0 ? (
            <div className="text-white/40 text-xs">
              No messages yet. Start coding!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-white/5 text-white/90'
                      : 'bg-blue-500/10 text-blue-300'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {msg.role === 'user' ? 'User:' : 'Assistant:'}
                  </div>
                  <div className="line-clamp-3">{msg.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/70">Apps</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        {messages.length > 0 && (
          <div className="h-12 bg-[#0a0a0a] border-b border-white/5 flex items-center px-6 gap-6">
            <button
              onClick={() => setActiveTab('preview')}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'text-white border-blue-400'
                  : 'text-white/50 border-transparent hover:text-white/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === 'code'
                  ? 'text-white border-blue-400'
                  : 'text-white/50 border-transparent hover:text-white/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Code
              </div>
            </button>
            <button
              onClick={() => setActiveTab('fullscreen')}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                activeTab === 'fullscreen'
                  ? 'text-white border-blue-400'
                  : 'text-white/50 border-transparent hover:text-white/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                Full screen
              </div>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <h1 className="text-4xl font-semibold text-white/90 text-center mb-4">
                  Build your ideas with AI
                </h1>
                <p className="text-white/50 text-center mb-12">
                  Make an AI coding studio which uses ai to generate code and website. User input turn into a fully functional website/app etc
                </p>

                {/* Tutorial Cards */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white/80 mb-6">
                    Supercharge your apps with AI
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {tutorialCards.map((card) => (
                      <button
                        key={card.id}
                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl p-6 text-left transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                            {card.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-white transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                              {card.description}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className="mb-8">
                  {msg.role === 'user' ? (
                    <div>
                      <div className="text-xs text-white/40 mb-2">User:</div>
                      <div className="text-white/90 text-sm">{msg.content}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-blue-400 mb-2 flex items-center gap-2">
                        <span>Gemini 2.5 Pro</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/40">Running</span>
                      </div>
                      {isThinking && idx === messages.length - 1 ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <div className="text-white/80 text-sm whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      )}

                      {/* Tutorial Card Suggestions */}
                      {!isThinking && idx === messages.length - 1 && (
                        <div className="mt-8 grid grid-cols-1 gap-4">
                          {tutorialCards.slice(0, 1).map((card) => (
                            <div
                              key={card.id}
                              className="bg-white/[0.03] border border-white/5 rounded-xl p-6"
                            >
                              <div className="flex items-center justify-center mb-4">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                                  {card.icon}
                                </div>
                              </div>
                              <h3 className="text-center text-base font-semibold text-white/90 mb-2">
                                {card.title}
                              </h3>
                              <p className="text-center text-xs text-white/50 leading-relaxed mb-4">
                                {card.description}
                              </p>
                              <button className="w-full py-2 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium text-white transition-colors">
                                Add to chat
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-blue-400 mb-8">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 bg-[#0a0a0a] p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Make changes, add new features, ask for anything"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-colors resize-none"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '200px'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Sparkles className="w-3 h-3" />
                <span>Powered by AI</span>
              </div>
              <div className="text-xs text-white/40">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      {showSettings && (
        <div className="w-96 bg-[#0a0a0a] border-l border-white/5 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white/90">Advanced settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Select model for the code assistant:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              >
                <option value="gpt-4">Default (Gemini 2.5 Pro)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-sonnet">Claude Sonnet 4.5</option>
              </select>
              <p className="mt-2 text-xs text-white/40">
                The model will be used by the code assistant to generate code.
              </p>
            </div>

            {/* System Instructions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                System instructions
              </label>
              <textarea
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                placeholder="Add custom instructions for your project to control style, models used, add specific knowledge, and more."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                rows={6}
              />
            </div>

            {/* System Instructions Template */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                System instructions template
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
              >
                <option value="react">React (TypeScript)</option>
                <option value="vue">Vue.js</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
                <option value="nextjs">Next.js</option>
              </select>
              <p className="mt-2 text-xs text-white/40">
                The configuration is for working with React + TypeScript application. Assumes a basic structure with index.html and index.tsx.
              </p>
            </div>

            {/* Microphone Selector */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Microphone selector
              </label>
              <div className="text-xs text-white/40">
                No microphones found.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
