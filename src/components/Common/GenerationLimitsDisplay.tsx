import React, { useEffect, useState } from 'react';
import { Image, Video, Music, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkGenerationLimit, GenerationType } from '../../lib/generationLimitsService';

interface GenerationLimit {
  type: GenerationType;
  icon: React.ElementType;
  label: string;
  current: number;
  limit: number;
  isPaid: boolean;
}

export const GenerationLimitsDisplay: React.FC = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<GenerationLimit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchLimits = async () => {
      try {
        const types: GenerationType[] = ['image', 'video', 'song', 'tts'];
        const limitsData: GenerationLimit[] = [];

        for (const type of types) {
          const limitInfo = await checkGenerationLimit(user.uid, type);

          limitsData.push({
            type,
            icon: getIcon(type),
            label: getLabel(type),
            current: limitInfo.current,
            limit: limitInfo.limit,
            isPaid: limitInfo.isPaid,
          });
        }

        setLimits(limitsData);
      } catch (error) {
        console.error('Error fetching generation limits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [user?.uid]);

  const getIcon = (type: GenerationType) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'song': return Music;
      case 'tts': return Mic;
      default: return Image;
    }
  };

  const getLabel = (type: GenerationType) => {
    switch (type) {
      case 'image': return 'Images';
      case 'video': return 'Videos';
      case 'song': return 'Songs';
      case 'tts': return 'Voice';
      default: return type;
    }
  };

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-[#00FFF0]';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <div className="animate-pulse">Loading limits...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {limits.map((limit) => {
        const Icon = limit.icon;
        const isUnlimited = limit.isPaid;
        const remaining = limit.limit - limit.current;
        const progressColor = getProgressColor(limit.current, limit.limit);

        return (
          <div
            key={limit.type}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00FFF0]/30 transition-all"
            title={isUnlimited ? `${limit.label}: Unlimited (token-based)` : `${remaining} ${limit.label} remaining this month`}
          >
            <Icon className="w-4 h-4 text-[#00FFF0]" />
            <span className="text-xs font-medium text-white/80">
              {isUnlimited ? (
                <span className="text-[#00FFF0]">∞</span>
              ) : (
                <>
                  <span className={limit.current >= limit.limit ? 'text-red-400' : 'text-white'}>
                    {limit.current}
                  </span>
                  <span className="text-white/50">/{limit.limit}</span>
                </>
              )}
            </span>
            {!isUnlimited && (
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all`}
                  style={{ width: `${Math.min((limit.current / limit.limit) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
