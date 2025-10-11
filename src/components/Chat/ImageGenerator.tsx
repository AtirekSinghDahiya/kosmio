/**
 * Image Generator Component - Enhanced
 * Beautiful AI image generation interface
 */

import React, { useState, useEffect } from 'react';
import { Image, Download, Wand2, X, Loader, Sparkles, RefreshCw } from 'lucide-react';
import { generateImageFree, GeneratedImage } from '../../lib/imageService';
import { useToast } from '../../contexts/ToastContext';

interface ImageGeneratorProps {
  onClose: () => void;
  onImageGenerated?: (image: GeneratedImage) => void;
  initialPrompt?: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onClose, onImageGenerated, initialPrompt = '' }) => {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('warning', 'Enter a prompt', 'Please describe what you want to create');
      return;
    }

    setIsGenerating(true);

    try {
      const image = await generateImageFree(prompt);
      setGeneratedImage(image);
      showToast('success', 'Success!', 'Your image has been generated');

      if (onImageGenerated) {
        onImageGenerated(image);
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      showToast('error', 'Generation failed', error.message || 'Could not generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `kosmio-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded!', 'Image saved to your device');
  };

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Image Studio</h2>
                <p className="text-sm text-white/70 mt-1">Transform your imagination into reality</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  Describe your vision
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A majestic dragon soaring through stormy clouds, lightning strikes in background, epic fantasy art, highly detailed, 8k quality"
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 min-h-[180px] resize-none transition-all"
                  disabled={isGenerating}
                  autoFocus
                />
                <p className="text-xs text-white/40 mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Be specific: include style, mood, lighting, and quality keywords
                </p>
              </div>

              {/* Tips */}
              <div className="glass-panel rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
                <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pro Tips
                </h3>
                <ul className="text-xs text-white/60 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Add style keywords: "photorealistic", "oil painting", "anime", "3D render"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Describe lighting: "golden hour", "dramatic shadows", "soft diffused light"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Include quality: "highly detailed", "8k", "sharp focus", "masterpiece"</span>
                  </li>
                </ul>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Image
                  </>
                )}
              </button>
            </div>

            {/* Right: Output */}
            <div className="space-y-4">
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border-2 border-white/20 group shadow-2xl">
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.prompt}
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Image load error');
                        showToast('error', 'Load failed', 'Could not display image');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Prompt Used</p>
                    <p className="text-white text-sm leading-relaxed">{generatedImage.prompt}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-8 text-center">
                  {isGenerating ? (
                    <div className="space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-purple-500 border-r-pink-500 rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-purple-400 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-semibold text-lg">Creating your masterpiece...</p>
                        <p className="text-white/60 text-sm">This usually takes 3-5 seconds</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Image className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-medium">Your image will appear here</p>
                        <p className="text-white/50 text-sm">Enter a prompt and click generate</p>
                      </div>
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
