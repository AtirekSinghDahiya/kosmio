import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AI_MODELS: AIModel[] = [
  // Chat Models
  { id: 'grok-2', name: 'Groq Llama 3.3', provider: 'Groq', description: 'Fast and powerful (Recommended)', category: 'chat' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Efficient chat model', category: 'chat' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Multimodal AI', category: 'chat' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable chat model', category: 'chat' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and efficient', category: 'chat' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Advanced reasoning', category: 'chat' },
  { id: 'moonshot-v1', name: 'Kimi', provider: 'Moonshot', description: 'Long context chat', category: 'chat' },

  // Code Models
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best for coding', category: 'code' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Advanced code generation', category: 'code' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Specialized code model', category: 'code' },

  // Image Models
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', description: 'High quality images', category: 'image' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'Stability AI', description: 'Open source image gen', category: 'image' },
  { id: 'firefly', name: 'Firefly', provider: 'Adobe', description: 'Commercial safe images', category: 'image' },

  // Video Models
  { id: 'sora', name: 'Sora', provider: 'OpenAI', description: 'Text to video', category: 'video' },

  // Audio Models
  { id: 'eleven-labs', name: 'ElevenLabs', provider: 'ElevenLabs', description: 'Natural voice synthesis', category: 'audio' },
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  category?: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  category = 'chat'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableModels = AI_MODELS.filter(m => m.category === category);
  const selected = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 text-white border border-white/10 hover:border-cyan-400/40 min-w-[220px] shadow-lg hover:shadow-xl"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-white/90">{selected.name}</div>
          <div className="text-xs text-white/50 mt-0.5">{selected.provider}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-all duration-300 text-cyan-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-3 w-full bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
              {availableModels.map((model, index) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group/item animate-fade-in-up ${
                    selectedModel === model.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30'
                      : 'hover:bg-white/10 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold transition-colors ${
                      selectedModel === model.id ? 'text-cyan-400' : 'text-white group-hover/item:text-cyan-300'
                    }`}>{model.name}</div>
                    <div className="text-xs text-white/50 mt-0.5 group-hover/item:text-white/70 transition-colors">{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="w-4 h-4 text-cyan-400 animate-fade-in" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
