import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, Mic, Palette, Code, Film } from 'lucide-react';
import { MainChat } from './MainChat';
import { ImageControls } from './Controls/ImageControls';
import { VideoControls } from './Controls/VideoControls';
import { MusicControls } from './Controls/MusicControls';
import { VoiceControls } from './Controls/VoiceControls';
import { AIModelSelector } from './AIModelSelector';
import { useAuth } from '../../hooks/useAuth';
import { getUnifiedPremiumStatus, UnifiedPremiumStatus } from '../../lib/unifiedPremiumAccess';
import { useStudioMode } from '../../contexts/StudioModeContext';

export type StudioMode = 'chat' | 'image' | 'video' | 'music' | 'voice';

interface UnifiedStudioChatProps {
  projectId?: string | null;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
}

export const UnifiedStudioChat: React.FC<UnifiedStudioChatProps> = ({
  projectId,
  projectName: initialProjectName,
  onProjectNameChange,
}) => {
  const { user } = useAuth();
  const { mode, setMode } = useStudioMode();
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [premiumStatus, setPremiumStatus] = useState<UnifiedPremiumStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState('grok-4-fast');

  // Image controls state
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [imageFormat, setImageFormat] = useState('jpeg');

  // Video controls state
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [videoDuration, setVideoDuration] = useState<4 | 6 | 8>(8);
  const [videoProvider, setVideoProvider] = useState('veo3-new');

  // Music controls state
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [musicDuration, setMusicDuration] = useState(60);

  // Voice controls state
  const [voiceId, setVoiceId] = useState('alloy');
  const [speechSpeed, setSpeechSpeed] = useState(1);

  useEffect(() => {
    const checkAccess = async () => {
      if (user?.uid) {
        const status = await getUnifiedPremiumStatus(user.uid);
        setPremiumStatus(status);
      }
    };
    checkAccess();
  }, [user]);

  const getModelInfo = () => {
    switch (mode) {
      case 'image':
        return {
          name: 'Image Generation',
          description: 'Create stunning images with AI',
          icon: ImageIcon,
        };
      case 'video':
        return {
          name: 'Video Generation',
          description: 'Generate videos from text prompts',
          icon: VideoIcon,
        };
      case 'music':
        return {
          name: 'Music Generation',
          description: 'Compose AI-generated music',
          icon: MusicIcon,
        };
      case 'voice':
        return {
          name: 'Voice Synthesis',
          description: 'Text-to-speech with AI voices',
          icon: Mic,
        };
      default:
        return {
          name: 'AI Chat',
          description: 'Chat with advanced AI models',
          icon: Sparkles,
        };
    }
  };

  const renderControls = () => {
    switch (mode) {
      case 'image':
        return (
          <ImageControls
            aspectRatio={imageAspectRatio}
            onAspectRatioChange={setImageAspectRatio}
            numImages={numImages}
            onNumImagesChange={setNumImages}
            outputFormat={imageFormat}
            onOutputFormatChange={setImageFormat}
          />
        );
      case 'video':
        return (
          <VideoControls
            aspectRatio={videoAspectRatio}
            onAspectRatioChange={setVideoAspectRatio}
            duration={videoDuration}
            onDurationChange={setVideoDuration}
            provider={videoProvider}
            onProviderChange={setVideoProvider}
          />
        );
      case 'music':
        return (
          <MusicControls
            makeInstrumental={makeInstrumental}
            onMakeInstrumentalChange={setMakeInstrumental}
            duration={musicDuration}
            onDurationChange={setMusicDuration}
          />
        );
      case 'voice':
        return (
          <VoiceControls
            voiceId={voiceId}
            onVoiceIdChange={setVoiceId}
            speed={speechSpeed}
            onSpeedChange={setSpeechSpeed}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Studio Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { mode: 'image', icon: Palette, label: 'Image', bgColor: 'bg-pink-500/10 hover:bg-pink-500/20', borderColor: 'border-pink-500/20', textColor: 'text-pink-400' },
                { mode: 'video', icon: Film, label: 'Video', bgColor: 'bg-blue-500/10 hover:bg-blue-500/20', borderColor: 'border-blue-500/20', textColor: 'text-blue-400' },
                { mode: 'music', icon: MusicIcon, label: 'Music', bgColor: 'bg-purple-500/10 hover:bg-purple-500/20', borderColor: 'border-purple-500/20', textColor: 'text-purple-400' },
                { mode: 'voice', icon: Mic, label: 'Voice', bgColor: 'bg-green-500/10 hover:bg-green-500/20', borderColor: 'border-green-500/20', textColor: 'text-green-400' },
              ].map((studio) => {
                const StudioIcon = studio.icon;
                const isActive = mode === studio.mode;
                return (
                  <button
                    key={studio.mode}
                    onClick={() => setMode(studio.mode as StudioMode)}
                    className={`group p-4 rounded-lg border transition-all ${
                      isActive
                        ? `${studio.bgColor.split('hover:')[1]} ${studio.borderColor} border-2`
                        : `bg-white/5 border-white/10 ${studio.bgColor}`
                    }`}
                  >
                    <StudioIcon className={`w-10 h-10 mx-auto mb-2 ${isActive ? studio.textColor : 'text-white/60 group-hover:text-white/80'} transition-colors`} />
                    <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {studio.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recent Projects */}
            <div>
              <h3 className="text-white/40 text-xs font-medium mb-3 tracking-wide uppercase">
                Recent Projects
              </h3>
              <div className="text-center py-12 text-white/30">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-sm">No projects yet</p>
                <p className="text-xs mt-1 text-white/20">Start creating to see your work here</p>
              </div>
            </div>
          </div>
        );
    }
  };

  const modelInfo = getModelInfo();
  const IconComponent = modelInfo.icon;

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Main Chat Component */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${showControlPanel ? 'mr-0 md:mr-80 lg:mr-96' : ''}`}>
        <MainChat />
      </div>

      {/* Floating Toggle Button - Always visible */}
      {!showControlPanel && (
        <button
          onClick={() => setShowControlPanel(true)}
          className="fixed bottom-24 right-6 z-30 p-4 rounded-full bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] text-white shadow-2xl hover:shadow-[#00FFF0]/50 transition-all hover:scale-110 group"
          title="Show Controls"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right Control Panel - Google AI Studio Style */}
      {showControlPanel && (
        <div className="absolute top-0 right-0 h-full w-full md:w-80 lg:w-96 bg-[#1a1a1a] border-l border-white/5 flex flex-col overflow-hidden z-20 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={() => setShowControlPanel(false)}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/5 text-white/60 hover:text-white transition-colors z-50"
            title="Close panel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Header - Clean & Minimal */}
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-white/90 text-sm font-medium tracking-wide mb-1">
              {mode === 'chat' ? 'SELECT STUDIO' : modelInfo.name.toUpperCase()}
            </h2>
            {mode !== 'chat' && (
              <p className="text-white/40 text-xs">{modelInfo.description}</p>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {renderControls()}
          </div>

          {/* Token Balance - Minimal Footer */}
          {premiumStatus && (
            <div className="px-6 py-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs font-medium">Balance</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-lg font-semibold">
                    {premiumStatus.totalTokens.toLocaleString()}
                  </span>
                  <span className="text-white/40 text-xs">tokens</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
