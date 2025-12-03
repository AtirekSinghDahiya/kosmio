import React, { useState, useEffect } from 'react';
import { X, Video, Loader, Download, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWithVeo3 } from '../../../lib/googleVeo3Service';
import { generateWithSora2 } from '../../../lib/openaiSora2Service';
import { generateWithVeo2 } from '../../../lib/veo2Service';
import { generateWithHailuo } from '../../../lib/minimaxHailuoService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { saveVideoToProject } from '../../../lib/contentSaveService';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';

interface VideoStudioProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  onClose,
  initialPrompt = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [selectedModel, setSelectedModel] = useState<'veo-2' | 'veo-3' | 'sora-2' | 'hailuo'>('veo-2');
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [duration, setDuration] = useState<4 | 6 | 8>(8);
  const [showControls, setShowControls] = useState(true);
  const [limitInfo, setLimitInfo] = useState<string>('');

  useEffect(() => {
    loadLimitInfo();
  }, [user]);

  const loadLimitInfo = async () => {
    if (!user?.uid) return;
    const limit = await checkGenerationLimit(user.uid, 'video');
    setLimitInfo(getGenerationLimitMessage('video', limit.isPaid, limit.current, limit.limit));
  };

  const models = [
    { id: 'veo-2' as const, label: 'Veo 2', subtitle: 'Fast and reliable', provider: 'google' },
    { id: 'hailuo' as const, label: 'Hailuo', subtitle: 'High-quality with camera control', provider: 'minimax' },
    { id: 'veo-3' as const, label: 'Veo 3.1', subtitle: 'Latest Google model', provider: 'google' },
    { id: 'sora-2' as const, label: 'Sora 2', subtitle: 'OpenAI advanced model', provider: 'openai' }
  ];

  const aspectRatios = [
    { id: 'landscape' as const, label: 'Landscape', icon: '▭', ratio: '16:9' },
    { id: 'portrait' as const, label: 'Portrait', icon: '▯', ratio: '9:16' },
    { id: 'square' as const, label: 'Square', icon: '⬜', ratio: '1:1' }
  ];

  const durations = [4, 6, 8] as const;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your video');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate videos');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    const providerMap = {
      'veo-2': 'veo-2',
      'veo-3': 'google-veo',
      'sora-2': 'openai-sora',
      'hailuo': 'minimax-hailuo'
    };

    const result = await executeGeneration({
      userId: user.uid,
      generationType: 'video',
      modelId: selectedModel,
      provider: providerMap[selectedModel],
      onProgress: setProgress
    }, async () => {
      if (selectedModel === 'veo-2') {
        return await generateWithVeo2({ prompt }, setProgress);
      } else if (selectedModel === 'veo-3') {
        return await generateWithVeo3({ prompt, aspectRatio, duration, resolution: '1080p' }, setProgress);
      } else if (selectedModel === 'hailuo') {
        return await generateWithHailuo({ prompt, duration: duration === 4 ? 6 : duration, resolution: '768P' }, setProgress);
      } else {
        return await generateWithSora2({ prompt, aspectRatio, duration, resolution: '1080p' }, setProgress);
      }
    });

    if (result.success && result.data) {
      setGeneratedVideoUrl(result.data);

      await saveVideoToProject(user.uid, prompt, result.data, {
        model: selectedModel,
        duration,
        provider: providerMap[selectedModel]
      });

      showToast('success', 'Video Generated!', 'Your video is ready and saved to projects');
      await loadLimitInfo();
    } else if (result.limitReached) {
      showToast('error', 'Limit Reached', result.error || 'Generation limit exceeded');
    } else if (result.insufficientTokens) {
      showToast('error', 'Insufficient Tokens', result.error || 'Not enough tokens');
    } else {
      showToast('error', 'Generation Failed', result.error || 'Failed to generate video');
    }

    setIsGenerating(false);
    setProgress('');
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `video_${Date.now()}.mp4`;
      link.click();
      showToast('success', 'Downloaded', 'Video saved to your device');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A2BE2] flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white truncate">Video Generation</h1>
            {limitInfo && <p className="text-xs text-white/40">{limitInfo}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black min-h-[40vh] lg:min-h-0">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-[#8A2BE2]" />
              <p className="text-white/60 text-sm sm:text-base text-center px-4">{progress || 'Generating...'}</p>
              <p className="text-xs text-white/40">This may take 1-3 minutes</p>
            </div>
          ) : generatedVideoUrl ? (
            <div className="max-w-full w-full space-y-4">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg border border-white/10 shadow-2xl max-h-[60vh] lg:max-h-full"
              />
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/30 text-[#8A2BE2] rounded-lg font-medium transition-all"
              >
                <Download className="w-5 h-5" />
                Download Video
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md px-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Ready to create</h3>
              <p className="text-sm sm:text-base text-white/40">
                Enter a prompt and click generate to create AI videos
              </p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[400px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-black max-h-[60vh] lg:max-h-none overflow-y-auto">
          <button
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">Controls</span>
            {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`${showControls ? 'block' : 'hidden lg:block'}`}>
            <div className="p-4 sm:p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">AI Model</label>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={isGenerating}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all ${
                      selectedModel === model.id
                        ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-white text-sm">{model.label}</div>
                    <div className="text-xs text-white/50">{model.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    disabled={isGenerating}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg border transition-all min-h-[60px] sm:min-h-[70px] ${
                      aspectRatio === ar.id
                        ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{ar.icon}</span>
                    <span className="text-[9px] sm:text-[10px] font-medium">{ar.ratio}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Duration</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {durations.map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur)}
                    disabled={isGenerating}
                    className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border text-sm font-medium transition-all min-h-[44px] ${
                      duration === dur
                        ? 'bg-[#8A2BE2]/20 border-[#8A2BE2]/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-white/10 bg-black mt-auto">
            <label className="text-sm font-medium text-white/80 mb-3 block">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene mountain landscape at sunrise..."
              className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 focus:border-[#8A2BE2]/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
              disabled={isGenerating}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-[#8A2BE2] hover:bg-[#8A2BE2]/90 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
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
