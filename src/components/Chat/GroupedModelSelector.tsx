import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Lock, Zap, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUnifiedPremiumStatus, UnifiedPremiumStatus } from '../../lib/unifiedPremiumAccess';
import { getModelCost, getTierBadgeColor, formatTokenDisplay } from '../../lib/modelTokenPricing';
import { AI_MODELS, AIModel } from './AIModelSelector';

interface GroupedModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  category?: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

interface ModelGroup {
  provider: string;
  models: AIModel[];
  icon: string;
}

export const GroupedModelSelector: React.FC<GroupedModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  category = 'chat'
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [premiumAccess, setPremiumAccess] = useState<UnifiedPremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setPremiumAccess(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const access = await getUnifiedPremiumStatus(currentUser.uid);
        setPremiumAccess(access);
      } catch (error) {
        console.error('Error getting premium access:', error);
        setPremiumAccess(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAccess();
  }, [currentUser]);

  // Group models by provider
  const modelGroups: ModelGroup[] = React.useMemo(() => {
    const filteredModels = AI_MODELS.filter(m => m.category === category);
    const grouped = new Map<string, AIModel[]>();

    filteredModels.forEach(model => {
      const provider = model.provider;
      if (!grouped.has(provider)) {
        grouped.set(provider, []);
      }
      grouped.get(provider)!.push(model);
    });

    const providerIcons: Record<string, string> = {
      'OpenAI': '🤖',
      'Anthropic': '🔮',
      'Google': '🌟',
      'X.AI': '⚡',
      'DeepSeek': '🧠',
      'Meta': '🦙',
      'NVIDIA': '🚀',
      'Qwen': '👁️',
      'Moonshot': '🌙',
      'MoonshotAI': '🌙',
      'Amazon': '📦',
      'Perplexity': '🔍',
      'LiquidAI': '💧',
      'IBM': '🪨',
      'Baidu': '🧩',
      'Z.AI': '⚙️',
      'Stability AI': '🎨',
      'Adobe': '🔥',
      'ElevenLabs': '🎙️'
    };

    return Array.from(grouped.entries())
      .map(([provider, models]) => ({
        provider,
        models: models.sort((a, b) => {
          const aCost = getModelCost(a.id);
          const bCost = getModelCost(b.id);
          const tierOrder = { 'free': 0, 'budget': 1, 'mid': 2, 'premium': 3, 'ultra-premium': 4 };
          return tierOrder[aCost.tier] - tierOrder[bCost.tier];
        }),
        icon: providerIcons[provider] || '🤖'
      }))
      .sort((a, b) => a.provider.localeCompare(b.provider));
  }, [category]);

  const isModelLocked = (modelId: string): boolean => {
    const modelCost = getModelCost(modelId);
    const isFree = modelCost.tier === 'free';
    return !isFree && !premiumAccess?.isPremium;
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="w-full space-y-3">
      {/* Current Selection Display */}
      <div className={`rounded-xl p-4 ${
        theme === 'light'
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
          : 'bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-400/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedModelData && getModelCost(selectedModelData.id).logoUrl ? (
              <img
                src={getModelCost(selectedModelData.id).logoUrl}
                alt={selectedModelData.provider}
                className="w-8 h-8 rounded"
              />
            ) : (
              <span className="text-2xl">{selectedModelData ? getModelCost(selectedModelData.id).icon : '🤖'}</span>
            )}
            <div>
              <div className={`text-sm font-semibold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {selectedModelData?.name || 'Select a model'}
              </div>
              <div className={`text-xs ${
                theme === 'light' ? 'text-gray-600' : 'text-white/60'
              }`}>
                {selectedModelData?.provider} • {selectedModelData?.description}
              </div>
            </div>
          </div>
          {selectedModelData && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                getTierBadgeColor(getModelCost(selectedModelData.id).tier)
              }`}>
                {getModelCost(selectedModelData.id).tier === 'free' ? 'FREE' : getModelCost(selectedModelData.id).tier.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/60">
                <Zap className="w-3 h-3" />
                {formatTokenDisplay(getModelCost(selectedModelData.id).tokensPerMessage)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Model Groups */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className={theme === 'light' ? 'text-gray-600' : 'text-white/60'}>
              Loading models...
            </p>
          </div>
        ) : (
          modelGroups.map((group) => (
            <div
              key={group.provider}
              className={`rounded-xl overflow-hidden border transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-200'
                  : 'bg-slate-900/50 border-white/10'
              }`}
            >
              {/* Provider Header */}
              <button
                onClick={() => setExpandedProvider(
                  expandedProvider === group.provider ? null : group.provider
                )}
                className={`w-full flex items-center justify-between p-4 transition-all ${
                  theme === 'light'
                    ? 'hover:bg-gray-50'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {group.provider} Models
                    </div>
                    <div className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-white/50'
                    }`}>
                      {group.models.length} model{group.models.length !== 1 ? 's' : ''} available
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${
                  expandedProvider === group.provider ? 'rotate-180' : ''
                } ${theme === 'light' ? 'text-gray-600' : 'text-cyan-400'}`} />
              </button>

              {/* Models List */}
              {expandedProvider === group.provider && (
                <div className={`border-t ${
                  theme === 'light' ? 'border-gray-200' : 'border-white/10'
                }`}>
                  {group.models.map((model) => {
                    const modelCost = getModelCost(model.id);
                    const isLocked = isModelLocked(model.id);
                    const isSelected = selectedModel === model.id;

                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          if (!isLocked) {
                            onModelChange(model.id);
                          }
                        }}
                        disabled={isLocked}
                        className={`w-full flex items-center justify-between p-4 transition-all ${
                          isLocked
                            ? 'opacity-50 cursor-not-allowed'
                            : isSelected
                              ? theme === 'light'
                                ? 'bg-blue-50'
                                : 'bg-cyan-500/20'
                              : theme === 'light'
                                ? 'hover:bg-gray-50'
                                : 'hover:bg-white/5'
                        } ${
                          theme === 'light' ? 'border-b border-gray-100' : 'border-b border-white/5'
                        } last:border-b-0`}
                      >
                        <div className="flex-1 text-left">
                          <div className={`text-sm font-semibold flex items-center gap-2 ${
                            isSelected
                              ? theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                              : theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {model.name}
                            {isLocked && <Lock className="w-3 h-3 text-yellow-500" />}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            theme === 'light' ? 'text-gray-600' : 'text-white/50'
                          }`}>
                            {model.description}
                            {isLocked && ' • Purchase tokens to unlock'}
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
                        {isSelected && !isLocked && (
                          <Check className={`w-5 h-5 ml-3 ${
                            theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
