import React, { useState } from 'react';
import { X, Wand2, Loader } from 'lucide-react';
import { generateWithImagen } from '../../lib/googleImagenService';
import { generateWithNanoBanana } from '../../lib/geminiNanoBananaService';
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
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape' | 'portrait' | '4:3' | '3:4'>('square');
  const [numImages, setNumImages] = useState(1);
  const [outputFormat, setOutputFormat] = useState<'JPEG' | 'PNG' | 'WebP'>('JPEG');
  const [selectedModel, setSelectedModel] = useState('imagen-4');

  const models = [
    { id: 'imagen-4', name: 'Google Imagen 4.0', description: 'Google\'s latest image model', speed: 'Fast', provider: 'google' },
    { id: 'nano-banana', name: 'Gemini Nano Banana', description: 'Gemini\'s built-in image generation', speed: 'Medium', provider: 'google' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your image');
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setProgress('Starting...');

    try {
      let imageUrl: string;

      if (selectedModel === 'imagen-4') {
        imageUrl = await generateWithImagen(
          {
            prompt,
            aspectRatio: aspectRatio === 'landscape' ? 'landscape' : aspectRatio === 'portrait' ? 'portrait' : 'square',
            numberOfImages: 1
          },
          (status) => setProgress(status)
        );
      } else {
        imageUrl = await generateWithNanoBanana(
          {
            prompt,
            aspectRatio: aspectRatio === 'landscape' ? 'landscape' : aspectRatio === 'portrait' ? 'portrait' : 'square',
            numberOfImages: 1
          },
          (status) => setProgress(status)
        );
      }

      setGeneratedImageUrl(imageUrl);
      showToast('success', 'Image Generated!', 'Your image is ready');

      if (user) {
        try {
          await saveImageToProject(user.uid, prompt, imageUrl, {
            model: selectedModel,
            dimensions: aspectRatio,
            provider: selectedModel === 'imagen-4' ? 'google-imagen' : 'google-gemini'
          });
        } catch (saveError) {
          console.error('Failed to save image:', saveError);
        }
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      const errorMessage = error.message || 'Failed to generate image. Please check your API key and try again.';
      showToast('error', 'Generation Failed', errorMessage);
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const aspectRatios = [
    { id: 'square' as const, label: 'Square', icon: '⬜', ratio: '1:1' },
    { id: 'landscape' as const, label: 'Landscape', icon: '▭', ratio: '16:9' },
    { id: 'portrait' as const, label: 'Portrait', icon: '▯', ratio: '9:16' },
    { id: '4:3' as const, label: '4:3', icon: '▬', ratio: '4:3' },
    { id: '3:4' as const, label: '3:4', icon: '▯', ratio: '3:4' }
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Wand2 className="w-5 h-5 text-teal-400" />
          <h1 className="text-lg font-semibold text-white">Image Generation</h1>
          <p className="text-sm text-white/40">Create stunning images with AI</p>
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
              <Loader className="w-16 h-16 animate-spin text-teal-400" />
              <p className="text-white/60">{progress || 'Generating your image...'}</p>
            </div>
          ) : generatedImageUrl ? (
            <div className="max-w-4xl w-full">
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="w-full rounded-lg border border-white/10 shadow-2xl"
              />
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Wand2 className="w-16 h-16 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Image preview</h3>
              <p className="text-white/40">
                Your generated image will appear here. Enter a prompt and click generate to start.
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Controls */}
        <div className="w-[420px] border-l border-white/10 flex flex-col bg-black">
          {/* Model Selector */}
          <div className="p-6 border-b border-white/10">
            <div className="text-sm font-semibold text-white mb-3">Model</div>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedModel === model.id
                      ? 'border-teal-500/40 bg-teal-500/10'
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

          {/* Aspect Ratio */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  disabled={isGenerating}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    aspectRatio === ar.id
                      ? 'bg-teal-500/20 border-teal-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{ar.icon}</span>
                  <span className="text-[10px] font-medium">{ar.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Images */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Number of Images: {numImages}</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumImages(num)}
                  disabled={isGenerating}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    numImages === num
                      ? 'bg-teal-500/20 border-teal-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Output Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['JPEG', 'PNG', 'WebP'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setOutputFormat(format)}
                  disabled={isGenerating}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    outputFormat === format
                      ? 'bg-teal-500/20 border-teal-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {format}
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
                placeholder="Describe your image... e.g., 'A majestic dragon soaring through stormy clouds'"
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 focus:border-teal-500/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
                disabled={isGenerating}
              />
              <div className="absolute bottom-3 right-3 text-xs text-white/30">
                {prompt.length} characters
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
