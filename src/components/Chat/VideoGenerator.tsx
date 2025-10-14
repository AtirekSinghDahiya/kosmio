import React, { useState, useEffect } from 'react';
import { Video, Download, Wand2, X, Loader, Sparkles, RefreshCw, Play } from 'lucide-react';
import { generateVideo, pollVideoStatus } from '../../lib/runwayService';
import { useToast } from '../../contexts/ToastContext';

interface VideoGeneratorProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onClose, initialPrompt = '' }) => {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt.trim();

    if (!promptToUse) {
      showToast('warning', 'Enter a prompt', 'Please describe the video you want to create');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideoUrl(null);

    try {
      showToast('info', 'Generating...', 'Your video is being created. This may take a minute.');

      const taskId = await generateVideo({
        prompt: promptToUse,
        duration,
        aspectRatio,
        model: 'gen3a_turbo'
      });

      const videoUrl = await pollVideoStatus(
        taskId,
        (currentProgress) => {
          setProgress(currentProgress);
        }
      );

      setGeneratedVideoUrl(videoUrl);
      setProgress(100);
      showToast('success', 'Success!', 'Your video has been generated');
    } catch (error: any) {
      console.error('Video generation error:', error);
      showToast('error', 'Generation failed', error.message || 'Could not generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;

    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = `kosmio-video-${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded!', 'Video saved to your device');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20 shadow-2xl animate-scale-in">
        <div className="relative bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Video Studio</h2>
                <p className="text-sm text-white/70 mt-1">Powered by Runway ML Gen-3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  Video Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to create... e.g., 'A monkey dancing in a forest'"
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating... {progress > 0 && `${Math.round(progress)}%`}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Video
                    </>
                  )}
                </button>

                {generatedVideoUrl && !isGenerating && (
                  <button
                    onClick={() => handleGenerate()}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isGenerating && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Generating your video...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative group">
                {generatedVideoUrl ? (
                  <>
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={handleDownload}
                      className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </>
                ) : isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      <Video className="w-6 h-6 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/90 font-medium">Creating your video...</p>
                      <p className="text-white/50 text-sm">This usually takes 30-60 seconds</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 inline-block">
                      <Play className="w-12 h-12 text-orange-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/90 font-medium">Your video will appear here</p>
                      <p className="text-white/50 text-sm">Describe what you want and click Generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
