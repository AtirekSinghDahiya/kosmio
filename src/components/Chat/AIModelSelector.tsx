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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/10 hover:border-white/20 min-w-[200px]"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">{selected.name}</div>
          <div className="text-xs text-gray-400">{selected.provider}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 max-h-64 overflow-y-auto">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-all ${
                    selectedModel === model.id ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">{model.name}</div>
                    <div className="text-xs text-gray-400">{model.description}</div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="w-4 h-4 text-blue-400" />
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
