/**
 * KroniQ Chat Studio
 * Professional interface for AI conversations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader, Copy, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';
import { getOpenRouterResponseWithUsage } from '../../lib/openRouterService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { deductTokensForRequest } from '../../lib/tokenService';
import { getModelCost } from '../../lib/modelTokenPricing';
import { MarkdownRenderer } from '../Chat/MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok-4-fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', speed: 'Very Fast' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', speed: 'Fast' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', speed: 'Fast' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', speed: 'Very Fast' },
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', speed: 'Fast' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to use chat');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await getOpenRouterResponseWithUsage(
        conversationHistory,
        selectedModel,
        1.0,
        4096
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Deduct tokens
      const modelCost = getModelCost(selectedModel);
      await deductTokensForRequest(
        user.uid,
        selectedModel,
        'openrouter',
        modelCost.costPerMessage,
        'chat'
      );
    } catch (error: any) {
      console.error('Chat error:', error);
      showToast('error', 'Chat Failed', error.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('success', 'Copied!', 'Message copied to clipboard');
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Model Selection */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold">AI Chat</h2>
          </div>
          <p className="text-xs text-white/50 mt-1">Multi-model conversation</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <label className="text-xs text-white/70 block mb-2">Select Model</label>
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                  selectedModel === model.id
                    ? 'bg-cyan-500/20 border-2 border-cyan-400 text-white'
                    : 'bg-white/5 border-2 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-sm font-medium">{model.name}</div>
                <div className="text-xs text-white/50 mt-0.5">{model.provider} • {model.speed}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                {models.find(m => m.id === selectedModel)?.name}
              </h1>
              <p className="text-sm text-white/60">
                {models.find(m => m.id === selectedModel)?.provider}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
              >
                New Chat
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                <p className="text-white/50">Ask me anything - I'm here to help</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Good response">
                          <ThumbsUp className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Bad response">
                          <ThumbsDown className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Regenerate">
                          <RotateCw className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold">U</span>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask KroniQ anything..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-14 py-3 text-sm resize-none focus:outline-none focus:border-cyan-400/50"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 bottom-2 w-10 h-10 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl flex items-center justify-center transition-all"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-80 border-l border-white/10 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">Chat Settings</h3>
          <p className="text-xs text-white/50 mt-1">Configure your conversation</p>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Conversation Info</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="text-white">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-white">{models.find(m => m.id === selectedModel)?.name}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Suggested Prompts</h4>
            <div className="space-y-2">
              {[
                'Explain quantum computing',
                'Write a Python function',
                'Create a marketing plan',
                'Summarize this article'
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(prompt)}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-lg text-xs transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
