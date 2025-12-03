import React, { useState, useEffect } from 'react';
import { X, Wand2, Loader, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWithImagen } from '../../../lib/googleImagenService';
import { generateWithNanoBanana } from '../../../lib/geminiNanoBananaService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { saveImageToProject } from '../../../lib/contentSaveService';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';

interface ImageStudioProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onClose,
  initialPrompt = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape' | 'portrait' | '4:3' | '3:4'>('square');
  const [selectedModel, setSelectedModel] = useState('imagen-4');
  const [showControls, setShowControls] = useState(true);
  const [limitInfo, setLimitInfo] = useState<string>('');

  useEffect(() => {
    loadLimitInfo();
  }, [user]);

  const loadLimitInfo = async () => {
    if (!user?.uid) return;
    const limit = await checkGenerationLimit(user.uid, 'image');
    setLimitInfo(getGenerationLimitMessage('image', limit.isPaid, limit.current, limit.limit));
  };

  const models = [
    { id: 'imagen-4', name: 'Imagen 4.0', description: 'Latest Google model', speed: 'Fast' },
    { id: 'nano-banana', name: 'Nano Banana', description: 'Gemini-powered', speed: 'Medium' },
  ];

  const aspectRatios = [
    { id: 'square' as const, label: 'Square', icon: '⬜', ratio: '1:1' },
    { id: 'landscape' as const, label: 'Landscape', icon: '▭', ratio: '16:9' },
    { id: 'portrait' as const, label: 'Portrait', icon: '▯', ratio: '9:16' },
    { id: '4:3' as const, label: '4:3', icon: '▬', ratio: '4:3' },
    { id: '3:4' as const, label: '3:4', icon: '▯', ratio: '3:4' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your image');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate images');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    const result = await executeGeneration({
      userId: user.uid,
      generationType: 'image',
      modelId: selectedModel,
      provider: selectedModel === 'imagen-4' ? 'google-imagen' : 'google-gemini',
      onProgress: setProgress
    }, async () => {
      if (selectedModel === 'imagen-4') {
        return await generateWithImagen({
          prompt,
          aspectRatio: aspectRatio === 'landscape' ? 'landscape' : aspectRatio === 'portrait' ? 'portrait' : 'square',
          numberOfImages: 1
        }, setProgress);
      } else {
        return await generateWithNanoBanana({
          prompt,
          aspectRatio: aspectRatio === 'landscape' ? 'landscape' : aspectRatio === 'portrait' ? 'portrait' : 'square',
          numberOfImages: 1
        }, setProgress);
      }
    });

    if (result.success && result.data) {
      setGeneratedImageUrl(result.data);

      await saveImageToProject(user.uid, prompt, result.data, {
        model: selectedModel,
        dimensions: aspectRatio,
        provider: selectedModel === 'imagen-4' ? 'google-imagen' : 'google-gemini'
      });

      showToast('success', 'Image Generated!', 'Your image is ready and saved to projects');
      await loadLimitInfo();
    } else if (result.limitReached) {
      showToast('error', 'Limit Reached', result.error || 'Generation limit exceeded');
    } else if (result.insufficientTokens) {
      showToast('error', 'Insufficient Tokens', result.error || 'Not enough tokens');
    } else {
      showToast('error', 'Generation Failed', result.error || 'Failed to generate image');
    }

    setIsGenerating(false);
    setProgress('');
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `image_${Date.now()}.jpg`;
      link.click();
      showToast('success', 'Downloaded', 'Image saved to your device');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FFF0] flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white truncate">Image Generation</h1>
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
              <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-[#00FFF0]" />
              <p className="text-white/60 text-sm sm:text-base text-center px-4">{progress || 'Generating...'}</p>
            </div>
          ) : generatedImageUrl ? (
            <div className="max-w-full w-full space-y-4">
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="w-full rounded-lg border border-white/10 shadow-2xl max-h-[60vh] lg:max-h-full object-contain"
              />
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00FFF0]/20 border border-[#00FFF0]/40 hover:bg-[#00FFF0]/30 text-[#00FFF0] rounded-lg font-medium transition-all"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>
            </div>
          ) : (
            <div className="text-center max-w-md px-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Wand2 className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Ready to create</h3>
              <p className="text-sm sm:text-base text-white/40">
                Enter a prompt and click generate to create stunning AI images
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
              <div className="text-sm font-semibold text-white mb-3">Model</div>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all ${
                      selectedModel === model.id
                        ? 'border-[#00FFF0]/40 bg-[#00FFF0]/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{model.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">{model.speed}</span>
                    </div>
                    <p className="text-xs text-white/50">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    disabled={isGenerating}
                    className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg border transition-all min-h-[60px] sm:min-h-[70px] ${
                      aspectRatio === ar.id
                        ? 'bg-[#00FFF0]/20 border-[#00FFF0]/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{ar.icon}</span>
                    <span className="text-[9px] sm:text-[10px] font-medium">{ar.ratio}</span>
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
              placeholder="A majestic dragon soaring through stormy clouds..."
              className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 focus:border-[#00FFF0]/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
              disabled={isGenerating}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-[#00FFF0] hover:bg-[#00FFF0]/90 disabled:bg-white/5 text-black font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
