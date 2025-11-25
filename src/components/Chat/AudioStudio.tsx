import React, { useState } from 'react';
import { Music, Mic, Volume2, X } from 'lucide-react';
import { MusicGenerator } from './MusicGenerator';
import { VoiceoverGenerator } from './VoiceoverGenerator';

interface AudioStudioProps {
  onClose?: () => void;
}

type AudioTab = 'suno' | 'elevenlabs' | 'gemini';

export const AudioStudio: React.FC<AudioStudioProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AudioTab>('suno');

  const tabs = [
    {
      id: 'suno' as AudioTab,
      label: 'Suno AI Music',
      icon: Music,
      description: 'Generate complete songs with vocals and instruments',
    },
    {
      id: 'elevenlabs' as AudioTab,
      label: 'ElevenLabs TTS',
      icon: Mic,
      description: 'Professional voice synthesis with 10 voice options',
    },
    {
      id: 'gemini' as AudioTab,
      label: 'Gemini TTS',
      icon: Volume2,
      description: 'Google\'s text-to-speech service',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'suno':
        return <MusicGenerator onClose={() => {}} />;
      case 'elevenlabs':
      case 'gemini':
        return <VoiceoverGenerator onClose={() => {}} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FFF0]" />
          <h1 className="text-lg sm:text-xl font-bold text-white">Audio Studio</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 border-2 border-[#00FFF0]/50 text-white'
                  : 'bg-white/5 border-2 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#00FFF0]' : ''}`} />
              <div className="flex flex-col items-start">
                <span className="text-xs sm:text-sm font-semibold">{tab.label}</span>
                <span className="hidden md:block text-[10px] sm:text-xs text-white/50">{tab.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
