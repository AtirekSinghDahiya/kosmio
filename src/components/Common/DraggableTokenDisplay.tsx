import React, { useState, useEffect, useRef } from 'react';
import { Coins, TrendingUp, GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TokenBalance {
  tier: string;
  dailyTokens: number;
  paidTokens: number;
  totalTokens: number;
  canUsePaidModels: boolean;
}

interface Position {
  x: number;
  y: number;
}

export const DraggableTokenDisplay: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type, paid_tokens_balance, free_tokens_balance, daily_free_tokens_remaining, is_paid, is_premium')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) {
        console.error('Error fetching token balance:', error);
        setBalance(null);
      } else if (profile) {
        const userType = profile.user_type || (profile.paid_tokens_balance > 0 ? 'paid' : 'free');
        const paidTokens = profile.paid_tokens_balance || 0;
        const freeTokens = profile.free_tokens_balance || 0;
        const dailyTokens = profile.daily_free_tokens_remaining || 0;

        const totalTokens = userType === 'paid' ? paidTokens : dailyTokens + freeTokens;

        setBalance({
          tier: userType === 'paid' || paidTokens > 0 || profile.is_paid ? 'premium' : 'free',
          dailyTokens,
          paidTokens,
          totalTokens,
          canUsePaidModels: userType === 'paid' || paidTokens > 0 || profile.is_paid || profile.is_premium
        });
      }
    } catch (error) {
      console.error('Exception fetching token balance:', error);
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`token-balance-${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.uid}`
        },
        () => {
          fetchBalance();
        }
      )
      .subscribe();

    const interval = setInterval(fetchBalance, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const savedPosition = localStorage.getItem('tokenDisplayPosition');
    const savedCollapsed = localStorage.getItem('tokenDisplayCollapsed');

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        console.error('Failed to parse saved position');
      }
    } else {
      const defaultX = window.innerWidth - 280;
      const defaultY = window.innerHeight - 150;
      setPosition({ x: Math.max(20, defaultX), y: Math.max(20, defaultY) });
    }

    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    const touch = e.touches[0];
    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !dragRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const rect = dragRef.current?.getBoundingClientRect();
        if (!rect) return;

        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        setPosition({ x: newX, y: newY });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('tokenDisplayPosition', JSON.stringify(position));
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, dragOffset, position]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('tokenDisplayCollapsed', String(newCollapsed));
  };

  const resetPosition = () => {
    const defaultX = window.innerWidth - 280;
    const defaultY = window.innerHeight - 150;
    const newPos = { x: Math.max(20, defaultX), y: Math.max(20, defaultY) };
    setPosition(newPos);
    localStorage.setItem('tokenDisplayPosition', JSON.stringify(newPos));
  };

  if (!user) return null;

  const getBalanceColor = () => {
    if (!balance) return 'text-gray-400';
    if (balance.tier === 'premium' || balance.paidTokens > 0) return 'text-white';
    if (balance.totalTokens >= 10000) return 'text-gray-300';
    if (balance.totalTokens >= 1000) return 'text-gray-400';
    return 'text-gray-500';
  };

  const getTierLabel = () => {
    if (!balance) return 'FREE';
    if (balance.tier === 'premium' && balance.paidTokens > 0) return 'PREMIUM';
    if (balance.tier === 'premium') return 'PREMIUM';
    return 'FREE';
  };

  const displayBalance = balance?.totalTokens || 0;

  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        zIndex: 9999
      }}
      className={`transition-all duration-200 ${isDragging ? 'cursor-grabbing scale-105 shadow-2xl' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className={`bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ${
        isDragging ? 'shadow-[#00FFF0]/30' : 'shadow-black/50'
      } ${isCollapsed ? 'w-auto' : 'w-64'}`}>
        <div className="flex items-center gap-2 px-4 py-3">
          <GripVertical className="w-4 h-4 text-white/40 flex-shrink-0" />
          {isCollapsed ? (
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-white">{displayBalance.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-white/70 font-medium">Tokens</span>
                </div>
                <span className={`text-[10px] font-bold ${getBalanceColor()} uppercase tracking-wide`}>
                  {getTierLabel()}
                </span>
              </div>
              {balance && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-xl font-bold text-white">
                    {displayBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
