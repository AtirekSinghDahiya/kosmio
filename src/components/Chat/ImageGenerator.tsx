import React, { useState, useEffect } from 'react';
import { Image, Download, Wand2, X, Loader, Sparkles } from 'lucide-react';
import { generateImage, isKieImageAvailable, ImageModel } from '../../lib/kieImageService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { saveImageToProject } from '../../lib/contentSaveService';

interface GeneratedImage {
  url: string;
  model?: string;
  prompt?: string;
  seed?: number;
  timestamp?: Date;
}

interface ImageGeneratorProps {
  onClose: () => void;
  onImageGenerated?: (image: GeneratedImage) => void;
  initialPrompt?: string;
  selectedModel?: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onClose, onImageGenerated, initialPrompt = '', selectedModel }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(
    (selectedModel as ImageModel) || 'nano-banana'
  );

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (selectedModel) {
      setSelectedImageModel(selectedModel as ImageModel);
    }
  }, [selectedModel]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    setIsGenerating(true);
    setImageLoading(true);

    try {
      const imageUrls = await generateImage(
        {
          model: selectedImageModel,
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
        (status) => {
          console.log(`Image generation: ${status}`);
        }
      );

      const image: GeneratedImage = {
        url: imageUrls[0],
        model: selectedImageModel,
        prompt: prompt,
        timestamp: new Date()
      };

      setGeneratedImage(image);

      if (user) {
        try {
          await saveImageToProject(user.uid, prompt, image.url, {
            model: selectedImageModel,
            dimensions: '1024x1024',
            provider: 'kie-ai'
          });
          console.log('✅ Image saved to project');
        } catch (saveError) {
          console.error('Failed to save image to project:', saveError);
        }
      }

      if (onImageGenerated) {
        onImageGenerated(image);
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      let errorMessage = error?.message || 'Could not generate image';
      showToast('error', 'Generation Failed', errorMessage);
      setImageLoading(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `kroniq-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="bg-black border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Image Generation</h2>
              <p className="text-xs text-white/50">Powered by Kie AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls */}
            <div className="space-y-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Model</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedImageModel('nano-banana')}
                    disabled={isGenerating}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                      selectedImageModel === 'nano-banana'
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">Nano Banana</div>
                    <div className="text-xs opacity-60">Google</div>
                  </button>
                  <button
                    onClick={() => setSelectedImageModel('seedreem')}
                    disabled={isGenerating}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                      selectedImageModel === 'seedreem'
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">Seedreem</div>
                    <div className="text-xs opacity-60">Flux</div>
                  </button>
                  <button
                    onClick={() => setSelectedImageModel('gpt-4o-image')}
                    disabled={isGenerating}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                      selectedImageModel === 'gpt-4o-image'
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">GPT-4o</div>
                    <div className="text-xs opacity-60">OpenAI</div>
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your image... e.g., 'A majestic dragon soaring through stormy clouds'"
                  className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 focus:border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none resize-none transition-all text-sm"
                  disabled={isGenerating}
                  autoFocus
                />
                <div className="text-xs text-white/30 text-right">{prompt.length} / 2000</div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>

              {/* Tips */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="text-sm font-semibold text-white/70 mb-2">Tips</h3>
                <ul className="text-xs text-white/50 space-y-1.5">
                  <li>• Add style keywords: "photorealistic", "oil painting", "anime"</li>
                  <li>• Describe lighting: "golden hour", "dramatic shadows"</li>
                  <li>• Include quality: "highly detailed", "8k", "sharp focus"</li>
                </ul>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              {generatedImage ? (
                <>
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                      </div>
                    )}
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="w-full h-auto min-h-[300px] object-contain"
                      crossOrigin="anonymous"
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleRegenerate}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all text-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full min-h-[400px] rounded-lg border border-white/10 flex flex-col items-center justify-center p-8 text-center bg-black">
                  {isGenerating ? (
                    <div className="space-y-4">
                      <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
                      <div className="space-y-2">
                        <p className="text-white font-medium text-sm">Creating your masterpiece...</p>
                        <p className="text-white/50 text-xs">This usually takes 3-5 seconds</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-full bg-white/5">
                        <Image className="w-8 h-8 text-white/40" />
                      </div>
                      <p className="text-white/40 text-sm">Image preview</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
