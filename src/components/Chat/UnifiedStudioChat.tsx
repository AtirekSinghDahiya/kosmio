import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, Mic } from 'lucide-react';
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
  const { mode } = useStudioMode();
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
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-3">
                AI Model
              </label>
              <AIModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60 text-sm">
                Select a model above to start chatting. Premium models offer enhanced capabilities and faster responses.
              </p>
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

      {/* Right Control Panel - Always available, collapsable */}
      {showControlPanel && (
        <div className="absolute top-0 right-0 h-full w-full md:w-80 lg:w-96 glass-panel border-l border-white/10 flex flex-col overflow-hidden z-20 transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex-shrink-0 bg-gradient-to-br from-black/40 to-black/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 text-[#00FFF0]" />
                <h3 className="text-white font-bold text-base md:text-lg">{modelInfo.name}</h3>
              </div>
              {premiumStatus?.isPremium && (
                <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 border border-[#00FFF0]/30">
                  <span className="text-[#00FFF0] text-xs font-semibold">PRO</span>
                </div>
              )}
            </div>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed">{modelInfo.description}</p>
          </div>

          {/* Controls */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderControls()}
          </div>

          {/* Token Balance Footer */}
          {premiumStatus && (
            <div className="p-4 border-t border-white/10 bg-gradient-to-br from-white/5 to-white/0 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-semibold uppercase">Token Balance</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
                  {premiumStatus.totalTokens.toLocaleString()}
                </span>
                <span className="text-white/40 text-xs md:text-sm">tokens</span>
              </div>
              {premiumStatus.paidTokens > 0 && (
                <div className="mt-1 text-xs text-white/50">
                  {premiumStatus.paidTokens.toLocaleString()} paid tokens available
                </div>
              )}
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setShowControlPanel(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-colors z-30 group"
            title="Hide Controls"
          >
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
