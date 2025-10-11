/**
 * Image Generator Component
 * Allows users to generate images with AI
 */

import React, { useState } from 'react';
import { Image, Download, Wand2, X, Loader } from 'lucide-react';
import { generateImageFree, GeneratedImage } from '../../lib/imageService';
import { useToast } from '../../contexts/ToastContext';

interface ImageGeneratorProps {
  onClose: () => void;
  onImageGenerated?: (image: GeneratedImage) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onClose, onImageGenerated }) => {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('warning', 'Warning', 'Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const image = await generateImageFree(prompt);
      setGeneratedImage(image);
      showToast('success', 'Success', 'Image generated successfully!');

      if (onImageGenerated) {
        onImageGenerated(image);
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      showToast('error', 'Error', error.message || 'Failed to generate image');
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
    showToast('success', 'Success', 'Image downloaded!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2]">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Image Generator</h2>
              <p className="text-sm text-white/60">Create stunning images with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Describe what you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A futuristic city at sunset with flying cars, cyberpunk style, highly detailed, 8k"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#00FFF0]/50 min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-white/40 mt-2">
              Be specific and descriptive for best results
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#00FFF0]/20 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-white/20 group">
                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full h-auto"
                  onError={(e) => {
                    console.error('Image load error');
                    showToast('error', 'Error', 'Failed to load generated image');
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-lg p-4 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Prompt</p>
                <p className="text-white text-sm">{generatedImage.prompt}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/20 border-t-[#00FFF0] rounded-full animate-spin"></div>
              </div>
              <p className="text-white font-medium">Creating your image...</p>
              <p className="text-white/60 text-sm">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
