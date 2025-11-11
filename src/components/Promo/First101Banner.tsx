import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Users, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface PromoStatus {
  users_granted: number;
  remaining_slots: number;
  status: 'ACTIVE' | 'ENDED';
}

export const First101Banner: React.FC = () => {
  const { theme } = useTheme();
  const [promoStatus, setPromoStatus] = useState<PromoStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromoStatus();

    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('first_101_banner_dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const loadPromoStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('first_101_promotion_status')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading promo status:', error);
      } else if (data) {
        setPromoStatus(data as PromoStatus);
      }
    } catch (error) {
      console.error('Exception loading promo status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('first_101_banner_dismissed', 'true');
  };

  // Don't show if dismissed, loading, ended, or no data
  if (dismissed || loading || !promoStatus || promoStatus.status === 'ENDED') {
    return null;
  }

  const slotsLeft = promoStatus.remaining_slots;
  const percentFilled = ((promoStatus.users_granted / 101) * 100).toFixed(0);
  const urgencyLevel = slotsLeft < 10 ? 'critical' : slotsLeft < 30 ? 'high' : 'normal';

  const getUrgencyColor = () => {
    if (urgencyLevel === 'critical') {
      return theme === 'light'
        ? 'bg-gradient-to-r from-red-500 to-pink-500'
        : 'bg-gradient-to-r from-red-600 to-pink-600';
    }
    if (urgencyLevel === 'high') {
      return theme === 'light'
        ? 'bg-gradient-to-r from-orange-500 to-red-500'
        : 'bg-gradient-to-r from-orange-600 to-red-600';
    }
    return theme === 'light'
      ? 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2]'
      : 'bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2]';
  };

  return (
    <div className={`relative ${getUrgencyColor()} text-white overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="relative px-4 sm:px-6 py-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-7xl mx-auto">
          {/* Icon */}
          <div className="flex-shrink-0 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                First 101 Users Get 5 Million Free Tokens!
              </h3>
              {urgencyLevel === 'critical' && (
                <span className="px-2 py-1 bg-white/30 rounded-full text-xs font-bold animate-pulse">
                  🔥 ALMOST GONE!
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{slotsLeft} spots remaining</span>
              </div>
              <div className="hidden sm:block">•</div>
              <span className="text-white/90">
                {urgencyLevel === 'critical'
                  ? '🚨 Last chance to join!'
                  : urgencyLevel === 'high'
                  ? '⚡ Limited spots remaining!'
                  : '🎉 Early access bonus'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <a
              href="/signup"
              className="block w-full sm:w-auto px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-white/90 transition-all hover:scale-105 text-center shadow-lg"
            >
              Claim Your 5M Tokens →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
