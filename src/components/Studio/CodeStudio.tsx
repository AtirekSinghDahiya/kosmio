import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Send,
  Sparkles,
  Play,
  Settings,
  FileCode,
  Zap,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOpenRouterResponse } from '../../lib/openRouterService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CodeModel {
  id: string;
  name: string;
  provider: string;
}

const CODING_MODELS: CodeModel[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen Coder', provider: 'Qwen' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral' },
];

const STARTER_TEMPLATES = [
  { id: 'portfolio', title: 'Portfolio Website', description: 'Modern portfolio with projects showcase', icon: '💼' },
  { id: 'ecommerce', title: 'E-commerce Platform', description: 'Full-featured online store', icon: '🛒' },
  { id: 'dashboard', title: 'Dashboard UI', description: 'Analytics dashboard with charts', icon: '📊' },
  { id: 'landing', title: 'Landing Page', description: 'Modern SaaS landing page', icon: '🚀' },
  { id: 'mobile', title: 'Mobile App', description: 'React Native mobile application', icon: '📱' },
  { id: 'api', title: 'REST API', description: 'Node.js backend with Express', icon: '⚡' },
];

const RECENT_PROMPTS = [
  'Build a todo app with React',
  'Create a modern pricing page',
  'Design an authentication flow',
  'Make a responsive navbar',
];

export const CodeStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CodeModel>(CODING_MODELS[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeView, setActiveView] = useState<'start' | 'chat'>('start');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (prompt?: string) => {
    const userPrompt = prompt || input.trim();
    if (!userPrompt || isGenerating) return;

    if (activeView === 'start') {
      setActiveView('chat');
    }

    const userMessage: Message = {
      role: 'user',
      content: userPrompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const systemPrompt = `You are an expert full-stack developer AI assistant. Generate complete, production-ready code based on user requests.

Guidelines:
- Use modern React with TypeScript and Tailwind CSS
- Include all necessary imports and setup
- Make code responsive and accessible
- Add proper error handling
- Include clear comments
- Provide complete, runnable code

Format your response with:
1. Brief explanation of the solution
2. Complete code in markdown code blocks
3. Usage instructions if needed`;

      const response = await getOpenRouterResponse(
        [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          userMessage
        ],
        selectedModel.id,
        currentUser?.uid || 'anonymous'
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating code:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">KronIQ AI Studio</h1>
            <p className="text-xs text-white/40">Create powerful applications with advanced AI assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
            >
              <span className="text-white/70">Model:</span>
              <span className="font-medium">{selectedModel.name}</span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </button>

            {showModelDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)} />
                <div className="absolute top-full right-0 mt-2 w-72 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <p className="text-xs text-white/50 px-2">Select AI Model</p>
                  </div>
                  {CODING_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">{model.name}</div>
                        <div className="text-xs text-white/40">{model.provider}</div>
                      </div>
                      {selectedModel.id === model.id && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">10.0M tokens</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-black">
          {/* Navigation */}
          <div className="p-4 border-b border-white/10">
            <div className="space-y-1">
              <button
                onClick={() => setActiveView('start')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'start' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Build</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Start</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <FileCode className="w-4 h-4" />
                <span className="text-sm font-medium">Gallery</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Code2 className="w-4 h-4" />
                <span className="text-sm font-medium">Your apps</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">FAQ</span>
              </button>
            </div>
          </div>

          {/* Content based on view */}
          {activeView === 'chat' ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold">Code assistant</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-white/60">
                    Add new features or easily modify this app with a prompt or the suggestions below
                  </p>
                </div>
              </div>

              {messages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2">Recent Prompts</p>
                  <div className="space-y-2">
                    {messages.slice(-3).map((msg, idx) => (
                      msg.role === 'user' && (
                        <div key={idx} className="p-2 bg-white/5 rounded text-xs text-white/70 border border-white/5 truncate">
                          {msg.content}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-white/40 mb-2">Suggestions</p>
                <div className="space-y-2">
                  {['Add aspect ratio options', 'Add negative prompt input', 'Improve error handling', 'Add image download button', 'Implement history'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSubmit(suggestion)}
                      disabled={isGenerating}
                      className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors text-sm disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Recently viewed</h3>
                <div className="space-y-2">
                  {RECENT_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(prompt)}
                      className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Input */}
          <div className="p-4 border-t border-white/10">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Make changes, add new features, ask for anything"
                className="w-full px-3 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-white/30"
                rows={3}
                disabled={isGenerating}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 bottom-2 p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          {activeView === 'start' && messages.length === 0 ? (
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-6">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Powered by Advanced AI Models</span>
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Supercharge your apps with AI
                </h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                  Create powerful applications with advanced AI assistance
                </p>
              </div>

              <div className="mb-12">
                <div className="flex gap-3 max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Describe your idea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-white/30"
                  />
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isGenerating}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        Build
                        <span className="text-lg">→</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-sm text-white/40">or</span>
                  <button className="text-sm text-blue-400 hover:underline">I'm feeling lucky</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {STARTER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSubmit(`Create a ${template.title.toLowerCase()}: ${template.description}`)}
                    className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-sm font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-xs text-white/50">{template.description}</p>
                  </button>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-sm text-white/40">Discover and remix app ideas</p>
                <button className="text-sm text-blue-400 hover:underline mt-2">Browse the app gallery →</button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="max-w-3xl w-full">
                <div className="space-y-4 mb-8">
                  {messages.map((message, idx) => (
                    <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10'}`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs mt-2 opacity-50">{message.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-sm text-white/70">Generating your application...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
