import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Sparkles } from 'lucide-react';
import { MainChat } from './MainChat';
import { StudioControlPanel, StudioMode } from './StudioControlPanel';
import { ChatControls } from './Controls/ChatControls';
import { ImageControls } from './Controls/ImageControls';
import { VideoControls } from './Controls/VideoControls';
import { MusicControls } from './Controls/MusicControls';
import { VoiceControls } from './Controls/VoiceControls';
import { useAuth } from '../../hooks/useAuth';
import { renameProject } from '../../lib/chatService';

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
  const [mode, setMode] = useState<StudioMode>('chat');
  const [projectName, setProjectName] = useState(initialProjectName || 'Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const [showControlPanel, setShowControlPanel] = useState(true);

  // Chat controls state
  const [selectedModel, setSelectedModel] = useState('grok-4-fast');
  const [temperature, setTemperature] = useState(1);

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
    if (initialProjectName) {
      setProjectName(initialProjectName);
      setEditedName(initialProjectName);
    }
  }, [initialProjectName]);

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
      case 'chat':
        return {
          name: selectedModel === 'grok-4-fast' ? 'Grok 4 Fast' : selectedModel === 'gpt-4-turbo-latest' ? 'GPT-4 Turbo' : 'Claude 3 Sonnet',
          description: 'Advanced AI chat model for conversations',
        };
      case 'image':
        return {
          name: 'Nano Banana',
          description: 'State-of-the-art image generation and editing model',
        };
      case 'video':
        return {
          name: videoProvider === 'veo3-new' ? 'Veo 3' : 'Sora 2',
          description: 'State-of-the-art video generation model',
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
        return { name: 'AI Model', description: 'AI powered generation' };
    }
  };

  const renderControls = () => {
    switch (mode) {
      case 'chat':
        return (
          <ChatControls
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            temperature={temperature}
            onTemperatureChange={setTemperature}
          />
        );
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Project Name Header */}
        <div className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                    className="bg-white/10 text-white border border-[#00FFF0] rounded-lg px-3 py-1.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#00FFF0]/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-[#00FFF0]/20 hover:bg-[#00FFF0]/30 text-[#00FFF0] transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group flex items-center gap-2 hover:bg-white/5 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <h1 className="text-xl font-bold text-white">{projectName}</h1>
                  <Edit2 className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00FFF0]/10 to-[#8A2BE2]/10 border border-[#00FFF0]/20">
                <Sparkles className="w-3 h-3 text-[#00FFF0]" />
                <span className="text-xs font-semibold text-white/80">
                  {mode === 'chat' ? 'Chat Mode' : mode === 'image' ? 'Image Studio' : mode === 'video' ? 'Video Studio' : mode === 'music' ? 'Music Studio' : 'Voice Studio'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowControlPanel(!showControlPanel)}
              className="px-4 py-2 rounded-lg glass-panel border border-white/20 text-white/70 hover:text-white hover:border-[#00FFF0]/30 transition-all text-sm font-semibold"
            >
              {showControlPanel ? 'Hide' : 'Show'} Controls
            </button>
          </div>
        </div>

        {/* Main Chat Component */}
        <div className="flex-1 overflow-hidden">
          <MainChat />
        </div>
      </div>

      {/* Right Control Panel */}
      {showControlPanel && (
        <StudioControlPanel
          mode={mode}
          onModeChange={setMode}
          modelName={modelInfo.name}
          modelDescription={modelInfo.description}
          controls={renderControls()}
        />
      )}
    </div>
  );
};
