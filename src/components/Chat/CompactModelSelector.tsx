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
    <div ref={dropdownRef} className="relative w-full">
      {/* Compact Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group ${
          theme === 'light'
            ? 'bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-blue-400 hover:shadow-blue-100'
            : 'bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-2 border-white/10 hover:border-cyan-400/50'
        } backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]`}
      >
        {/* Model Icon/Logo */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            {selectedModelCost?.logoUrl ? (
              <img
                src={selectedModelCost.logoUrl}
                alt={selectedModelData?.provider}
                className="w-7 h-7 rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            )}
          </div>

          {/* Model Name and Info */}
          <div className="flex flex-col items-start min-w-0">
            <div className={`text-sm font-bold truncate max-w-full ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {selectedModelData?.name || 'Select Model'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-medium ${
                theme === 'light' ? 'text-gray-500' : 'text-white/50'
              }`}>
                {selectedModelData?.provider}
              </span>
              {selectedModelCost && (
                <>
                  <span className="text-xs text-white/20">•</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${
                    getTierBadgeColor(selectedModelCost.tier)
                  }`}>
                    {selectedModelCost.tier === 'free' ? 'FREE' : selectedModelCost.tier.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-white/40">
                    <Zap className="w-3 h-3" />
                    {formatTokenDisplay(selectedModelCost.tokensPerMessage)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-5 h-5 transition-all flex-shrink-0 ${
          isOpen ? 'rotate-180 text-cyan-400' : ''
        } ${theme === 'light' ? 'text-gray-400 group-hover:text-blue-500' : 'text-white/40 group-hover:text-cyan-400'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border max-h-96 overflow-y-auto z-50 animate-fade-in ${
          theme === 'light'
            ? 'bg-white/95 border-gray-200'
            : 'bg-slate-900/98 border-white/20'
        } backdrop-blur-2xl`}>
          {modelGroups.map((group) => (
            <div key={group.provider} className="py-2">
              {/* Provider Header */}
              <div className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider sticky top-0 backdrop-blur-xl z-10 ${
                theme === 'light' ? 'text-gray-600 bg-gray-50/90' : 'text-white/50 bg-slate-800/90'
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
