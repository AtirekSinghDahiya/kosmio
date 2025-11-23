import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Send,
  Sparkles,
  Eye,
  FileCode2,
  Download,
  Copy,
  Maximize2,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOpenRouterResponse } from '../../lib/openRouterService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: {
    language: string;
    content: string;
  }[];
}

interface CodeModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

const CODE_MODELS: CodeModel[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best overall coding model' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Fast and capable' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Latest GPT-4 model' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Specialized for coding' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Google\'s advanced model' },
  { id: 'qwen/qwen-2.5-coder-32b', name: 'Qwen Coder', provider: 'Alibaba', description: 'Powerful code generation' },
  { id: 'mistralai/mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral', description: 'Fast and efficient' },
];

export const NewCodeStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CodeModel>(CODE_MODELS[0]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('split');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        language: match[1] || 'text',
        content: match[2].trim()
      });
    }

    return matches;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const systemPrompt = `You are an expert full-stack developer. Generate clean, modern, production-ready code based on user requests.

Key guidelines:
- Use React with TypeScript when appropriate
- Include proper HTML structure with modern CSS (Tailwind when possible)
- Make it responsive and visually appealing
- Include all necessary code in code blocks with language tags
- Add brief explanations
- Ensure code is complete and runnable

Respond with complete, working code that can be copied and used immediately.`;

      const response = await getOpenRouterResponse(
        [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage.content }
        ],
        selectedModel.id,
        currentUser?.uid || 'anonymous'
      );

      const codeBlocks = extractCodeBlocks(response);

      if (codeBlocks.length > 0) {
        setGeneratedCode(codeBlocks[0].content);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        code: codeBlocks
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating code:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error generating code. Please try again.',
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

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-code.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const updatePreview = () => {
    if (previewRef.current && generatedCode) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedCode);
        doc.close();
      }
    }
  };

  useEffect(() => {
    updatePreview();
  }, [generatedCode]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Code2 className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold">Code Studio</h1>
            <span className="text-sm text-white/50">Vibe Coding</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{selectedModel.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showModelDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                  {CODE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">{model.name}</div>
                          <div className="text-xs text-white/50 mt-1">{model.provider}</div>
                        </div>
                        {selectedModel.id === model.id && (
                          <Check className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-1">{model.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'preview' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'split' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <FileCode2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  viewMode === 'code' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className={`${viewMode === 'preview' ? 'hidden' : 'w-1/2'} border-r border-white/10 flex flex-col`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Start Vibe Coding</h2>
                    <p className="text-white/50 mb-6">
                      Describe what you want to build, and I'll generate complete, working code for you.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <button
                        onClick={() => setInput('Create a modern landing page with hero section')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                      >
                        Create a modern landing page
                      </button>
                      <button
                        onClick={() => setInput('Build a todo app with React')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                      >
                        Build a todo app with React
                      </button>
                      <button
                        onClick={() => setInput('Design a pricing page component')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                      >
                        Design a pricing page component
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.code && message.code.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.code.map((block, i) => (
                          <div key={i} className="bg-black/30 rounded p-3 border border-white/10">
                            <div className="text-xs text-white/50 mb-2">{block.language}</div>
                            <pre className="text-xs overflow-x-auto">
                              <code>{block.content}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-white/40 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating code...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to build..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preview/Code Panel */}
          <div className={`${viewMode === 'code' ? 'hidden' : 'flex-1'} flex flex-col bg-zinc-950`}>
            {/* Preview Header */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
              <span className="text-sm text-white/50">Live Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="p-2 hover:bg-white/5 rounded transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={downloadCode}
                  className="p-2 hover:bg-white/5 rounded transition-colors"
                  title="Download code"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (previewRef.current) {
                      previewRef.current.requestFullscreen();
                    }
                  }}
                  className="p-2 hover:bg-white/5 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
              {generatedCode ? (
                <iframe
                  ref={previewRef}
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts"
                  title="Code Preview"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <FileCode2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
