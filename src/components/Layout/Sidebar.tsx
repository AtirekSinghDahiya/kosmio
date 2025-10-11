import React, { useState } from 'react';
import { FolderOpen, CreditCard, Settings, LogOut, BarChart3, Sparkles, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { signOut, userData } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'voice', label: 'Voice Studio', icon: Mic },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  if (userData?.plan === 'enterprise') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: BarChart3 });
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFF0]/20 to-[#8A2BE2]/20 flex items-center justify-center flex-shrink-0 border border-white/20">
            <img src="/logo.svg" alt="Kosmio" className="w-8 h-8" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm whitespace-nowrap">Kosmio</p>
              <p className="text-white/60 text-xs whitespace-nowrap">AI Studio</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {isExpanded && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          {isExpanded && userData && (
            <div className="px-3 py-3 bg-white/5 rounded-xl mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/70">Token Usage</span>
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  {userData.plan}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((userData.tokensUsed || 0) / (userData.tokensLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-white/50">
                {userData.tokensUsed?.toLocaleString() || 0} / {userData.tokensLimit?.toLocaleString() || 0}
              </p>
            </div>
          )}

          <button
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              currentView === 'settings'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            title={!isExpanded ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm whitespace-nowrap">Settings</span>}
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            title={!isExpanded ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
