/**
 * KroniQ Studio Router
 * Main navigation system for all studios
 */

import React, { useState } from 'react';
import {
  MessageSquare, Image, Video, Music, Mic, Presentation,
  Settings, Home, User, LogOut, Coins, Menu, X
} from 'lucide-react';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { MusicStudio } from './MusicStudio';
import { TTSStudio } from './TTSStudio';
import { PPTStudio } from './PPTStudio';
import { ChatStudio } from './ChatStudio';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { TokenBalanceDisplay } from '../Common/TokenBalanceDisplay';

export type StudioType = 'chat' | 'image' | 'video' | 'music' | 'tts' | 'ppt';

interface StudioRoute {
  id: StudioType;
  name: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  color: string;
}

export const StudioRouter: React.FC = () => {
  const { signOut, userData } = useAuth();
  const { navigateTo } = useNavigation();
  const [activeStudio, setActiveStudio] = useState<StudioType>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studios: StudioRoute[] = [
    { id: 'chat', name: 'Chat Models', icon: MessageSquare, component: ChatStudio, color: 'cyan' },
    { id: 'image', name: 'Image Generation', icon: Image, component: ImageStudio, color: 'blue' },
    { id: 'video', name: 'Video Generation', icon: Video, component: VideoStudio, color: 'purple' },
    { id: 'music', name: 'Music Studio', icon: Music, component: MusicStudio, color: 'pink' },
    { id: 'tts', name: 'Text-to-Speech', icon: Mic, component: TTSStudio, color: 'green' },
    { id: 'ppt', name: 'PPT Generator', icon: Presentation, component: PPTStudio, color: 'orange' },
  ];

  const currentStudio = studios.find(s => s.id === activeStudio);
  const StudioComponent = currentStudio?.component || ChatStudio;

  const handleStudioChange = (studioId: StudioType) => {
    setActiveStudio(studioId);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-black">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-black/95 lg:bg-transparent backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">KroniQ</h1>
                <p className="text-xs text-white/50">AI Creative Studio</p>
              </div>
            </div>
          </div>

          {/* Token Balance */}
          <div className="p-4 border-b border-white/10">
            <TokenBalanceDisplay
              isExpanded={true}
              showDetails={true}
              onPurchaseClick={() => navigateTo('billing')}
            />
          </div>

          {/* Studio Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wide px-3 mb-2">
                Studios
              </p>
              {studios.map((studio) => {
                const Icon = studio.icon;
                const isActive = activeStudio === studio.id;

                return (
                  <button
                    key={studio.id}
                    onClick={() => handleStudioChange(studio.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? `text-${studio.color}-400` : ''}`} />
                    <span className="text-sm font-medium">{studio.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => navigateTo('settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>

            <button
              onClick={() => navigateTo('profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Profile</span>
            </button>

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <StudioComponent />
      </div>
    </div>
  );
};
