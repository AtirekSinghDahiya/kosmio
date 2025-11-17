import React, { useState } from 'react';
import { X, Video, Loader, Play } from 'lucide-react';
import { generateVideoSimple, VideoModel } from '../../lib/simpleVideoGen';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { saveVideoToProject } from '../../lib/contentSaveService';

interface SimpleVideoGeneratorProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const SimpleVideoGenerator: React.FC<SimpleVideoGeneratorProps> = ({
  onClose,
  initialPrompt = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [selectedModel, setSelectedModel] = useState<VideoModel>('veo-3');
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [duration, setDuration] = useState<4 | 6 | 8>(8);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your video');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setProgress('Starting...');

    try {
      const videoUrl = await generateVideoSimple(
        { prompt, aspectRatio, duration },
        selectedModel,
        (status) => {
          setProgress(status);
        }
      );

      setGeneratedVideoUrl(videoUrl);
      showToast('success', 'Video Generated!', 'Your video is ready');

      if (user) {
        try {
          await saveVideoToProject(user.uid, prompt, videoUrl, {
            model: selectedModel,
            duration,
            provider: 'fal-ai'
          });
        } catch (saveError) {
          console.error('Failed to save video:', saveError);
        }
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const models = [
    { id: 'veo-3' as const, label: 'Veo 3 (New)', subtitle: 'Latest Google model' },
    { id: 'sora-2' as const, label: 'Sora 2', subtitle: 'OpenAI model' },
    { id: 'veo-3-legacy' as const, label: 'Veo 3 (Legacy)', subtitle: 'Previous version' }
  ];

  const aspectRatios = [
    { id: 'landscape' as const, label: 'Landscape', icon: '▭', ratio: '16:9' },
    { id: 'portrait' as const, label: 'Portrait', icon: '▯', ratio: '9:16' },
    { id: 'square' as const, label: 'Square', icon: '⬜', ratio: '1:1' }
  ];

  const durations = [4, 6, 8] as const;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-semibold text-white">Video Generation</h1>
          <p className="text-sm text-white/40">Powered by Google Veo 3 via Kie AI</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-black">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-16 h-16 animate-spin text-purple-400" />
              <p className="text-white/60">{progress || 'Generating your video...'}</p>
              <p className="text-xs text-white/40">This may take 1-3 minutes</p>
            </div>
          ) : generatedVideoUrl ? (
            <div className="max-w-4xl w-full">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg border border-white/10 shadow-2xl"
              />
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Play className="w-16 h-16 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Video preview</h3>
              <p className="text-white/40">
                Your generated video will appear here. Enter a prompt and click generate to start.
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Controls */}
        <div className="w-[420px] border-l border-white/10 flex flex-col bg-black">
          {/* AI Model */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">AI Model</label>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  disabled={isGenerating}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedModel === model.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium text-white text-sm">{model.label}</div>
                  <div className="text-xs text-white/50">{model.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  disabled={isGenerating}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    aspectRatio === ar.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{ar.icon}</span>
                  <span className="text-[10px] font-medium">{ar.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  disabled={isGenerating}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    duration === dur
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {dur} seconds
                </button>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Prompt Input at Bottom */}
          <div className="p-6 border-t border-white/10 bg-black">
            <label className="text-sm font-medium text-white/80 mb-3 block">Prompt</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your video... e.g., 'A serene mountain landscape at sunrise'"
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
                disabled={isGenerating}
              />
              <div className="absolute bottom-3 right-3 text-xs text-white/30">
                {prompt.length} characters
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
