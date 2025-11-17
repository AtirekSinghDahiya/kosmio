import React, { useState } from 'react';
import { X, Wand2, Download, Loader } from 'lucide-react';
import { generateImageSimple, isImageGenerationAvailable } from '../../lib/simpleImageGen';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { saveImageToProject } from '../../lib/contentSaveService';

interface SimpleImageGeneratorProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const SimpleImageGenerator: React.FC<SimpleImageGeneratorProps> = ({
  onClose,
  initialPrompt = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your image');
      return;
    }

    if (!isImageGenerationAvailable()) {
      showToast('error', 'Service Unavailable', 'Image generation is not configured');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setProgress('Starting...');

    try {
      const imageUrl = await generateImageSimple(prompt, (status) => {
        setProgress(status);
      });

      setGeneratedImageUrl(imageUrl);
      showToast('success', 'Image Generated!', 'Your image is ready');

      if (user) {
        try {
          await saveImageToProject(user.uid, prompt, imageUrl, {
            model: 'flux-schnell',
            dimensions: 'square_hd',
            provider: 'fal-ai'
          });
        } catch (saveError) {
          console.error('Failed to save image:', saveError);
        }
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Could not generate image');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `kroniq-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full bg-black">
      {/* Left Panel - Controls */}
      <div className="w-[400px] border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Image Generation</h2>
              <p className="text-xs text-white/40">Create stunning images with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image... e.g., 'A majestic dragon soaring through stormy clouds'"
              className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 focus:border-teal-500/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
              disabled={isGenerating}
            />
            <div className="text-xs text-white/30">{prompt.length} characters</div>
          </div>

          {/* Model Info */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-teal-400"></div>
              <span className="text-xs font-semibold text-white">Flux Schnell</span>
            </div>
            <p className="text-[11px] text-white/50">Fast, high-quality image generation</p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {/* Progress */}
          {progress && (
            <div className="text-xs text-white/60 text-center">{progress}</div>
          )}

          {/* Tips */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-xs font-semibold text-white mb-2">Tips</h4>
            <ul className="text-[11px] text-white/50 space-y-1">
              <li>• Be specific and detailed in your description</li>
              <li>• Add style keywords: "photorealistic", "oil painting", "anime"</li>
              <li>• Describe lighting: "golden hour", "dramatic shadows"</li>
              <li>• Include quality: "highly detailed", "8k", "sharp focus"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-teal-400" />
            <p className="text-sm text-white/60">{progress || 'Generating your image...'}</p>
          </div>
        ) : generatedImageUrl ? (
          <div className="w-full max-w-3xl space-y-4">
            <div className="relative group">
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="w-full rounded-lg border border-white/10"
              />
              <button
                onClick={handleDownload}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/80 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/60 mb-1">Prompt:</p>
              <p className="text-sm text-white">{prompt}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
              <Wand2 className="w-12 h-12 text-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Image preview</h3>
              <p className="text-sm text-white/40">
                Your generated image will appear here. Enter a prompt and click generate to start.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
