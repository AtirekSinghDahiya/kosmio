import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AI_MODELS: AIModel[] = [
  // Chat Models (All via OpenRouter)
  { id: 'grok-2', name: 'Grok 4 Fast', provider: 'X.AI', description: 'Fast reasoning with images (Recommended)', category: 'chat' },
  { id: 'gpt-5-chat', name: 'GPT-5 Chat', provider: 'OpenAI', description: 'Latest ChatGPT with images', category: 'chat' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Advanced reasoning with images', category: 'chat' },
  { id: 'nemotron', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Powerful reasoning and coding', category: 'chat' },
  { id: 'qwen', name: 'Qwen3 235B Thinking', provider: 'Qwen', description: 'Advanced reasoning with thinking process', category: 'chat' },
  { id: 'deepseek', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Efficient and smart', category: 'chat' },
  { id: 'gemini', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'Fast multimodal AI with images', category: 'chat' },
  { id: 'kimi', name: 'Kimi K2', provider: 'Moonshot', description: 'Long context understanding', category: 'chat' },
  { id: 'chatgpt-image', name: 'GPT-5 Image Mini', provider: 'OpenAI', description: 'Optimized for image analysis', category: 'chat' },

  // Code Models
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Best for coding', category: 'code' },
  { id: 'nemotron', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Excellent for complex code', category: 'code' },
  { id: 'qwen', name: 'Qwen3 235B Thinking', provider: 'Qwen', description: 'Reasoning for complex problems', category: 'code' },
  { id: 'gpt-5-chat', name: 'GPT-5 Chat', provider: 'OpenAI', description: 'Advanced code generation', category: 'code' },
  { id: 'deepseek', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Specialized for code', category: 'code' },

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
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const availableModels = AI_MODELS.filter(m => m.category === category);
  const selected = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  return (
    <div className="relative group">
      {/* Gradient Border Effect */}
      <div className={`relative rounded-xl p-[2px] shadow-lg ${
        theme === 'light'
          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
          : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600'
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`relative w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 min-w-[220px] ${
            theme === 'light'
              ? 'bg-white/95 hover:bg-white text-gray-900 backdrop-blur-xl'
              : 'bg-slate-900/95 hover:bg-slate-800/95 text-white backdrop-blur-xl'
          }`}
        >
        <div className="flex-1 text-left">
          <div className={`text-sm font-semibold ${
            theme === 'light' ? 'text-gray-900' : 'text-white/90'
          }`}>{selected.name}</div>
          <div className={`text-xs mt-0.5 ${
            theme === 'light' ? 'text-gray-500' : 'text-white/50'
          }`}>{selected.provider}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
          theme === 'light' ? 'text-gray-600' : 'text-cyan-400'
        } ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute bottom-full left-0 mb-3 w-full backdrop-blur-3xl border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in ${
            theme === 'light'
              ? 'bg-white/95 border-gray-200'
              : 'glass-panel border-white/20'
          }`}>
            <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
              {availableModels.map((model, index) => (
                <button
                  key={model.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group/item animate-fade-in-up ${
                    selectedModel === model.id
                      ? theme === 'light'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30'
                      : theme === 'light'
                        ? 'hover:bg-gray-100 border border-transparent'
                        : 'hover:bg-white/10 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold transition-colors ${
                      selectedModel === model.id
                        ? theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                        : theme === 'light' ? 'text-gray-900 group-hover/item:text-blue-600' : 'text-white group-hover/item:text-cyan-300'
                    }`}>{model.name}</div>
                    <div className={`text-xs mt-0.5 transition-colors ${
                      theme === 'light'
                        ? 'text-gray-600 group-hover/item:text-gray-800'
                        : 'text-white/50 group-hover/item:text-white/70'
                    }`}>{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className={`w-4 h-4 animate-fade-in ${
                      theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                    }`} />
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
