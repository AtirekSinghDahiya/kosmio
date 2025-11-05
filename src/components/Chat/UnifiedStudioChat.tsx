import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Sparkles, Settings, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, Mic } from 'lucide-react';
import { MainChat } from './MainChat';
import { ImageControls } from './Controls/ImageControls';
import { VideoControls } from './Controls/VideoControls';
import { MusicControls } from './Controls/MusicControls';
import { VoiceControls } from './Controls/VoiceControls';
import { useAuth } from '../../hooks/useAuth';
import { renameProject } from '../../lib/chatService';
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
  const [projectName, setProjectName] = useState(initialProjectName || 'New Chat');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<UnifiedPremiumStatus | null>(null);

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

  useEffect(() => {
    if (initialProjectName) {
      setProjectName(initialProjectName);
      setEditedName(initialProjectName);
    }
  }, [initialProjectName]);

  // Auto-show panel when switching to studio modes (first time only)
  useEffect(() => {
    if (mode !== 'chat') {
      setShowControlPanel(true);
    } else {
      setShowControlPanel(false);
    }
  }, [mode]);

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== projectName) {
      setProjectName(editedName);
      setIsEditingName(false);

      if (projectId && user?.uid) {
        try {
          await renameProject(projectId, editedName);
          onProjectNameChange?.(editedName);
        } catch (error) {
          console.error('Failed to rename project:', error);
        }
      }
    } else {
      setIsEditingName(false);
      setEditedName(projectName);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(projectName);
  };

  const getModelInfo = () => {
    switch (mode) {
      case 'image':
        return {
          name: 'Nano Banana',
          description: 'State-of-the-art image generation model',
        };
      case 'video':
        return {
          name: videoProvider === 'veo3-new' ? 'Veo 3' : 'Sora 2',
          description: 'Advanced video generation model',
        };
      case 'music':
        return {
          name: 'Suno AI',
          description: 'AI music composition and generation',
        };
      case 'voice':
        return {
          name: 'OpenAI TTS',
          description: 'Text-to-speech synthesis',
        };
      default:
        return null;
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
        return null;
    }
  };

  const modelInfo = getModelInfo();
  const showStudioControls = mode !== 'chat';
  const hasActiveProject = !!projectId;

  const modeIcons = {
    image: ImageIcon,
    video: VideoIcon,
    music: MusicIcon,
    voice: Mic,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {/* Project Name Header - Only show when there's an active project AND in studio mode */}
      {showStudioControls && hasActiveProject && (
        <div className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 md:px-6 py-3 z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="bg-white/10 text-white border border-[#00FFF0] rounded-lg px-2 md:px-3 py-1 md:py-1.5 text-sm md:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#00FFF0]/50 w-32 md:w-auto"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 md:p-1.5 rounded-lg bg-[#00FFF0]/20 hover:bg-[#00FFF0]/30 text-[#00FFF0] transition-colors"
                  >
                    <Check className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 md:px-3 py-1 md:py-1.5 transition-colors"
                >
                  <h1 className="text-sm md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">{projectName}</h1>
                  <Edit2 className="w-3 h-3 md:w-4 md:h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                </button>
              )}

              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-[#00FFF0]/10 to-[#8A2BE2]/10 border border-[#00FFF0]/20">
                {mode !== 'chat' && React.createElement(modeIcons[mode as keyof typeof modeIcons], { className: "w-3 h-3 text-[#00FFF0]" })}
                <span className="text-[10px] md:text-xs font-semibold text-white/80">
                  {mode === 'image' ? 'Image Studio' : mode === 'video' ? 'Video Studio' : mode === 'music' ? 'Music Studio' : 'Voice Studio'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Chat Component */}
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${showStudioControls && showControlPanel ? 'mr-0 md:mr-80 lg:mr-96' : ''}`}>
          <MainChat />
        </div>

        {/* Floating Toggle Button - Only show in studio modes when there's an active project */}
        {showStudioControls && hasActiveProject && !showControlPanel && (
          <button
            onClick={() => setShowControlPanel(true)}
            className="fixed bottom-24 right-6 z-30 p-4 rounded-full bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] text-white shadow-2xl hover:shadow-[#00FFF0]/50 transition-all hover:scale-110 group"
            title="Show Studio Controls"
          >
            <Settings className="w-6 h-6 animate-pulse group-hover:animate-spin" />
          </button>
        )}

        {/* Right Control Panel - Only for studio modes with active project */}
        {showStudioControls && hasActiveProject && showControlPanel && modelInfo && (
          <div className="absolute top-0 right-0 h-full w-full md:w-80 lg:w-96 glass-panel border-l border-white/10 flex flex-col overflow-hidden z-20 transform transition-transform duration-300 ease-in-out">
            {/* Model Info Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-base md:text-lg">{modelInfo.name}</h3>
                <div className="flex items-center gap-1">
                  {premiumStatus?.isPremium && (
                    <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 border border-[#00FFF0]/30">
                      <span className="text-[#00FFF0] text-xs font-semibold">PRO</span>
                    </div>
                  )}
                  <Sparkles className="w-4 h-4 text-[#00FFF0]" />
                </div>
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

            {/* Close Button */}
            <button
              onClick={() => setShowControlPanel(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-colors z-30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
