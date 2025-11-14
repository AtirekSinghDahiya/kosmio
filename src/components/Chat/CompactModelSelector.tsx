import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lock, Zap, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUnifiedPremiumStatus } from '../../lib/unifiedPremiumAccess';
import { getModelCost, getTierBadgeColor, formatTokenDisplay } from '../../lib/modelTokenPricing';
import { AI_MODELS, AIModel } from './AIModelSelector';

interface CompactModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  category?: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const CompactModelSelector: React.FC<CompactModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  category = 'chat'
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) return;
      try {
        const access = await getUnifiedPremiumStatus(currentUser.uid);
        setIsPremium(access.isPremium);
      } catch (error) {
        console.error('Error checking premium access:', error);
      }
    };
    checkAccess();
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Group models by provider
  const modelGroups = React.useMemo(() => {
    const filteredModels = AI_MODELS.filter(m => m.category === category);
    const grouped = new Map<string, AIModel[]>();

    filteredModels.forEach(model => {
      const provider = model.provider;
      if (!grouped.has(provider)) {
        grouped.set(provider, []);
      }
      grouped.get(provider)!.push(model);
    });

    return Array.from(grouped.entries())
      .map(([provider, models]) => ({
        provider,
        models: models.sort((a, b) => {
          const aCost = getModelCost(a.id);
          const bCost = getModelCost(b.id);
          const tierOrder = { 'free': 0, 'budget': 1, 'mid': 2, 'premium': 3, 'ultra-premium': 4 };
          return tierOrder[aCost.tier] - tierOrder[bCost.tier];
        })
      }))
      .sort((a, b) => a.provider.localeCompare(b.provider));
  }, [category]);

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  const selectedModelCost = selectedModelData ? getModelCost(selectedModelData.id) : null;
  const isModelLocked = (modelId: string): boolean => {
    const modelCost = getModelCost(modelId);
    return modelCost.tier !== 'free' && !isPremium;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Compact Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
          theme === 'light'
            ? 'bg-white border-2 border-gray-200 hover:border-blue-400'
            : 'bg-slate-900/80 border-2 border-white/20 hover:border-cyan-400/50'
        } backdrop-blur-sm shadow-lg hover:shadow-xl`}
      >
        {/* Model Icon/Logo */}
        <div className="flex items-center gap-2">
          {selectedModelCost?.logoUrl ? (
            <img
              src={selectedModelCost.logoUrl}
              alt={selectedModelData?.provider}
              className="w-6 h-6 rounded"
            />
          ) : (
            <Sparkles className="w-5 h-5 text-cyan-400" />
          )}

          {/* Model Name and Info */}
          <div className="flex flex-col items-start">
            <div className={`text-sm font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {selectedModelData?.name || 'Select Model'}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${
                theme === 'light' ? 'text-gray-500' : 'text-white/50'
              }`}>
                {selectedModelData?.provider}
              </span>
              {selectedModelCost && (
                <>
                  <span className="text-xs text-white/30">•</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    getTierBadgeColor(selectedModelCost.tier)
                  }`}>
                    {selectedModelCost.tier === 'free' ? 'FREE' : selectedModelCost.tier.toUpperCase()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 transition-transform ${
          isOpen ? 'rotate-180' : ''
        } ${theme === 'light' ? 'text-gray-600' : 'text-cyan-400'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border max-h-96 overflow-y-auto z-50 ${
          theme === 'light'
            ? 'bg-white border-gray-200'
            : 'bg-slate-900/95 border-white/20'
        } backdrop-blur-xl`}>
          {modelGroups.map((group) => (
            <div key={group.provider} className="py-2">
              {/* Provider Header */}
              <div className={`px-4 py-2 text-xs font-semibold ${
                theme === 'light' ? 'text-gray-500' : 'text-white/40'
              }`}>
                {group.provider}
              </div>

              {/* Models */}
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
                        setIsOpen(false);
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full px-4 py-2.5 flex items-center justify-between transition-all ${
                      isLocked
                        ? 'opacity-50 cursor-not-allowed'
                        : isSelected
                          ? theme === 'light'
                            ? 'bg-blue-50'
                            : 'bg-cyan-500/20'
                          : theme === 'light'
                            ? 'hover:bg-gray-50'
                            : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Model Info */}
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium flex items-center gap-2 ${
                          isSelected
                            ? theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                            : theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>
                          {model.name}
                          {isLocked && <Lock className="w-3 h-3 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            getTierBadgeColor(modelCost.tier)
                          }`}>
                            {modelCost.tier === 'free' ? 'FREE' : modelCost.tier.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/60">
                            <Zap className="w-3 h-3" />
                            {formatTokenDisplay(modelCost.tokensPerMessage)}
                          </span>
                        </div>
                      </div>

                      {/* Selected Check */}
                      {isSelected && !isLocked && (
                        <Check className={`w-5 h-5 ${
                          theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
