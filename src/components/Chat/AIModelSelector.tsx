import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { checkPaidAccess } from '../../lib/paidAccessService';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AI_MODELS: AIModel[] = [
  // Chat Models
  { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'X.AI', description: 'Fast reasoning with images (Recommended)', category: 'chat' },
  { id: 'deepseek-v3.1-free', name: 'DeepSeek V3.1 Free', provider: 'DeepSeek', description: 'Efficient and smart', category: 'chat' },
  { id: 'nemotron-nano-free', name: 'Nemotron Nano 9B V2', provider: 'NVIDIA', description: 'Fast nano model', category: 'chat' },
  { id: 'qwen-vl-30b-free', name: 'Qwen3 VL 30B Thinking', provider: 'Qwen', description: 'Visual & thinking model', category: 'chat' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast Claude 3 model', category: 'chat' },
  { id: 'gemini-flash-lite-free', name: 'Gemini 2.5 Flash Lite', provider: 'Google', description: 'Fast multimodal AI', category: 'chat' },
  { id: 'kimi-k2-free', name: 'Kimi K2 Free', provider: 'Moonshot', description: 'Long context', category: 'chat' },
  { id: 'llama-4-maverick-free', name: 'Llama 4 Maverick Free', provider: 'Meta', description: 'Latest Llama', category: 'chat' },
  { id: 'codex-mini', name: 'Codex Mini', provider: 'OpenAI', description: 'Lightweight coding', category: 'chat' },
  { id: 'lfm2-8b', name: 'LiquidAI LFM2-8B', provider: 'LiquidAI', description: 'Efficient model', category: 'chat' },
  { id: 'granite-4.0', name: 'Granite 4.0 Micro', provider: 'IBM', description: 'Micro model', category: 'chat' },
  { id: 'ernie-4.5', name: 'ERNIE 4.5 21B Thinking', provider: 'Baidu', description: 'Thinking model', category: 'chat' },
  { id: 'perplexity-sonar', name: 'Perplexity Sonar', provider: 'Perplexity', description: 'Web search enabled AI', category: 'chat' },
  { id: 'gpt-5-chat', name: 'GPT-5 Chat', provider: 'OpenAI', description: 'Latest ChatGPT with images', category: 'chat' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Most advanced DeepSeek', category: 'chat' },
  { id: 'nemotron-super', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Powerful reasoning', category: 'chat' },
  { id: 'qwen-vl-32b', name: 'Qwen3 VL 32B Instruct', provider: 'Qwen', description: 'Visual model', category: 'chat' },
  { id: 'kimi-k2-0905', name: 'Kimi K2 0905', provider: 'MoonshotAI', description: 'Latest Kimi model', category: 'chat' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Fast Claude 4.5', category: 'chat' },
  { id: 'perplexity-sonar-pro', name: 'Perplexity Sonar Pro', provider: 'Perplexity', description: 'Pro web search with vision', category: 'chat' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Advanced reasoning', category: 'chat' },
  { id: 'perplexity-sonar-reasoning', name: 'Perplexity Sonar Reasoning Pro', provider: 'Perplexity', description: 'Advanced reasoning with search', category: 'chat' },
  { id: 'perplexity-sonar-deep', name: 'Perplexity Sonar Deep Research', provider: 'Perplexity', description: 'Deep research capabilities', category: 'chat' },
  { id: 'gemini-flash-image', name: 'Gemini 2.5 Flash Image', provider: 'Google', description: 'Image focused', category: 'chat' },
  { id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', description: 'Latest Llama', category: 'chat' },
  { id: 'glm-4.6', name: 'GLM 4.6', provider: 'Z.AI', description: 'Advanced model', category: 'chat' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', description: 'Powerful Opus model', category: 'chat' },
  { id: 'claude-opus-4.1', name: 'Claude Opus 4.1', provider: 'Anthropic', description: 'Ultimate AI model', category: 'chat' },
];

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  availableModels: AIModel[];
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  availableModels,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(true); // Default to true for better UX
  const [isLoading, setIsLoading] = useState(true);

  // Simple access check - if user has ANY tokens, they get everything
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.uid) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const accessStatus = await checkPaidAccess(user.uid);
      console.log('🎯 ModelSelector - Access check:', {
        userId: user.uid,
        hasAccess: accessStatus.hasAccess,
        totalTokens: accessStatus.totalTokens,
        reason: accessStatus.reason
      });

      setHasAccess(accessStatus.hasAccess);
      setIsLoading(false);
    };

    checkAccess();

    // Refresh access every 5 seconds
    const interval = setInterval(checkAccess, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleModelSelect = (model: AIModel) => {
    console.log('🎯 Model selected:', model.id);
    onModelChange(model);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all min-w-[280px] ${
          theme === 'light'
            ? 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200'
            : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 hover:from-purple-900/30 hover:to-pink-900/30 border border-purple-500/30'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
        <div className="flex-1 text-left">
          <div className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            {selectedModel.name}
          </div>
          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {selectedModel.provider}
          </div>
        </div>
        {isLoading && (
          <div className={`text-xs px-2 py-0.5 rounded-full ${
            theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-300'
          }`}>
            Checking...
          </div>
        )}
        {!isLoading && hasAccess && (
          <div className={`text-xs px-2 py-0.5 rounded-full ${
            theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900/40 text-green-300'
          }`}>
            Full Access
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute top-full left-0 mt-2 w-[400px] rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto ${
              theme === 'light'
                ? 'bg-white border border-gray-200'
                : 'bg-slate-900 border border-white/20'
            }`}
          >
            <div className={`sticky top-0 p-3 border-b ${
              theme === 'light'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-gray-200'
                : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-white/10'
            }`}>
              <div className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                {isLoading ? (
                  '🔄 Checking access...'
                ) : hasAccess ? (
                  '✅ All models unlocked'
                ) : (
                  '⚠️ Purchase tokens to unlock all models'
                )}
              </div>
            </div>

            <div className="p-2">
              {availableModels.map((model, index) => {
                const isSelected = selectedModel.id === model.id;

                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all text-left ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
                          : 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/40'
                        : theme === 'light'
                        ? 'hover:bg-gray-50 border border-transparent'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium mb-0.5 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {model.name}
                      </div>
                      <div className={`text-xs ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {model.provider} • {model.description}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className={`w-4 h-4 flex-shrink-0 ${
                        theme === 'light' ? 'text-purple-600' : 'text-purple-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
