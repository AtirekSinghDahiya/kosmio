import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Lock, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getUserTier, isModelPaid, type UserTier } from '../../lib/tierAccessService';
import { getModelCost, getTierBadgeColor, formatTokenDisplay, isModelFree } from '../../lib/modelTokenPricing';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AI_MODELS: AIModel[] = [
  // Free Chat Models
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

  // Paid Chat Models
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

  // Code Models
  { id: 'gpt-5-codex', name: 'GPT-5 Codex', provider: 'OpenAI', description: 'Best for coding (Paid)', category: 'code' },
  { id: 'codex-mini', name: 'Codex Mini', provider: 'OpenAI', description: 'Lightweight coding (Free)', category: 'code' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Excellent for code (Paid)', category: 'code' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Specialized for code (Paid)', category: 'code' },
  { id: 'deepseek-v3.1-free', name: 'DeepSeek V3.1 Free', provider: 'DeepSeek', description: 'Code model (Free)', category: 'code' },

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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check tier on mount and when dropdown opens
  useEffect(() => {
    if (user?.uid) {
      setIsLoadingTier(true);
      getUserTier(user.uid).then(tierInfo => {
        console.log('🔍 AIModelSelector - User tier info:', tierInfo);
        const isPaid = tierInfo.tier === 'paid';
        setUserTier(tierInfo.tier);
        setIsPaidUser(isPaid);
        console.log('🔍 AIModelSelector - isPaidUser set to:', isPaid);
        console.log('🔍 AIModelSelector - Will unlock models:', isPaid);
        setIsLoadingTier(false);
      }).catch(err => {
        console.error('Failed to get user tier:', err);
        setIsLoadingTier(false);
      });
    } else {
      setUserTier('free');
      setIsPaidUser(false);
      setIsLoadingTier(false);
    }
  }, [user, refreshKey]);

  // Refresh tier when dropdown opens
  useEffect(() => {
    if (isOpen && user?.uid) {
      setRefreshKey(prev => prev + 1);
    }
  }, [isOpen, user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const availableModels = AI_MODELS.filter(m => m.category === category);
  const selected = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  return (
    <div ref={dropdownRef} className="relative group w-full max-w-full">
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
          className={`relative w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white/95 hover:bg-white text-gray-900 backdrop-blur-xl'
              : 'bg-slate-900/95 hover:bg-slate-800/95 text-white backdrop-blur-xl'
          }`}
        >
        {getModelCost(selected.id).logoUrl ? (
          <img src={getModelCost(selected.id).logoUrl} alt={selected.provider} className="w-5 h-5 sm:w-6 sm:h-6 rounded flex-shrink-0" />
        ) : (
          <span className="text-lg sm:text-xl flex-shrink-0">{getModelCost(selected.id).icon}</span>
        )}
        <div className="flex-1 text-left min-w-0">
          <div className={`text-xs sm:text-sm font-semibold truncate ${
            theme === 'light' ? 'text-gray-900' : 'text-white/90'
          }`}>{selected.name}</div>
          <div className={`text-[10px] sm:text-xs mt-0.5 flex items-center gap-1 sm:gap-2 ${
            theme === 'light' ? 'text-gray-500' : 'text-white/50'
          }`}>
            <span className="truncate">{selected.provider}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {formatTokenDisplay(getModelCost(selected.id).tokensPerMessage)}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${
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
          <div className={`absolute bottom-full left-0 right-0 mb-3 w-full backdrop-blur-3xl border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in ${
            theme === 'light'
              ? 'bg-white/95 border-gray-200'
              : 'glass-panel border-white/20'
          }`}>
            <div className="p-2 max-h-[50vh] sm:max-h-72 overflow-y-auto scrollbar-thin">
              {availableModels.map((model, index) => {
                const modelCost = getModelCost(model.id);
                const isPaidModel = !isModelFree(model.id);
                // Show as unlocked if: loading, user is paid, or model is free
                const isLocked = isPaidModel && !isPaidUser && !isLoadingTier;

                console.log(`Model ${model.name}: isPaidModel=${isPaidModel}, isPaidUser=${isPaidUser}, isLoading=${isLoadingTier}, isLocked=${isLocked}`);

                return (
                  <button
                    key={model.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={isLocked}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group/item animate-fade-in-up ${
                      isLocked
                        ? 'opacity-50 cursor-not-allowed'
                        : selectedModel === model.id
                          ? theme === 'light'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/30'
                          : theme === 'light'
                            ? 'hover:bg-gray-100 border border-transparent'
                            : 'hover:bg-white/10 border border-transparent hover:border-white/10'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold transition-colors flex items-center gap-2 ${
                        selectedModel === model.id
                          ? theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                          : theme === 'light' ? 'text-gray-900 group-hover/item:text-blue-600' : 'text-white group-hover/item:text-cyan-300'
                      }`}>
                        {modelCost.logoUrl ? (
                          <img src={modelCost.logoUrl} alt={model.provider} className="w-5 h-5 rounded" />
                        ) : (
                          <span className="text-lg">{modelCost.icon}</span>
                        )}
                        {model.name}
                        {isLocked && <Lock className="w-3 h-3 text-yellow-500" />}
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors flex items-center gap-2 ${
                        theme === 'light'
                          ? 'text-gray-600 group-hover/item:text-gray-800'
                          : 'text-white/50 group-hover/item:text-white/70'
                      }`}>
                        <span>{model.description}</span>
                        {isLocked && <span>• Purchase tokens to unlock</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          getTierBadgeColor(modelCost.tier)
                        }`}>
                          {modelCost.tier === 'free' ? 'FREE' : modelCost.tier.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/60">
                          <Zap className="w-3 h-3" />
                          {formatTokenDisplay(modelCost.tokensPerMessage)}/msg
                        </span>
                      </div>
                    </div>
                    {selectedModel === model.id && !isLocked && (
                      <Check className={`w-4 h-4 animate-fade-in ${
                        theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
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
