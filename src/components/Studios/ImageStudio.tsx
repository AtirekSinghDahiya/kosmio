/**
 * KroniQ Image Generation Studio
 * Professional interface for AI image creation
 */

import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Download, Loader, Sparkles } from 'lucide-react';
import { generateWithImagen } from '../../lib/googleImagenService';
import { generateWithNanoBanana } from '../../lib/geminiNanoBananaService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveImageToProject } from '../../lib/contentSaveService';
import { checkGenerationLimit, incrementGenerationCount } from '../../lib/generationLimitsService';
import { deductTokensForRequest } from '../../lib/tokenService';
import { getModelCost } from '../../lib/modelTokenPricing';

export const ImageStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  // Settings
  const [selectedModel, setSelectedModel] = useState('imagen-4');
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape' | 'portrait'>('square');
  const [temperature, setTemperature] = useState(1);

  const models = [
    {
      id: 'imagen-4',
      name: 'Gemini 2.5 Flash Preview',
      description: 'gemini-2.5-flash-image\nState-of-the-art image generation and editing model.'
    },
    {
      id: 'nano-banana',
      name: 'Nano Banana',
      description: 'Gemini\'s experimental image model'
    },
  ];

  const aspectRatios = [
    { value: 'square', label: 'Auto', description: '1:1' },
    { value: 'landscape', label: '16:9', description: 'Landscape' },
    { value: 'portrait', label: '9:16', description: 'Portrait' },
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

    const limitCheck = await checkGenerationLimit(user.uid, 'image');
    if (!limitCheck.canGenerate) {
      showToast('error', 'Generation Limit Reached', limitCheck.message);
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setProgress('Starting generation...');

    try {
      let imageUrl: string;

      if (selectedModel === 'imagen-4') {
        imageUrl = await generateWithImagen(
          { prompt, aspectRatio, numberOfImages: 1 },
          (status) => setProgress(status)
        );
      } else {
        imageUrl = await generateWithNanoBanana(
          { prompt, aspectRatio, numberOfImages: 1 },
          (status) => setProgress(status)
        );
      }

      setGeneratedImageUrl(imageUrl);

      const modelCost = getModelCost(selectedModel === 'imagen-4' ? 'imagen-4' : 'nano-banana');
      const provider = selectedModel === 'imagen-4' ? 'google-imagen' : 'google-gemini';
      await deductTokensForRequest(user.uid, selectedModel, provider, modelCost.costPerMessage, 'image');
      await incrementGenerationCount(user.uid, 'image');

      await saveImageToProject(user.uid, prompt, imageUrl, {
        model: selectedModel,
        dimensions: aspectRatio,
        provider
      });

      showToast('success', 'Image Generated!', 'Your image has been created and saved');
      setProgress('');
    } catch (error: any) {
      console.error('Image generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate image');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `kroniq-image-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Prompt Input */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold">Text-to-Image Dance Prompts</h2>
          </div>
          <p className="text-xs text-white/50 mt-1">287 tokens</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="generate image of a person dancing"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-cyan-400/50"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full mt-4 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/30 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Run
              </>
            )}
          </button>

          {isGenerating && progress && (
            <p className="text-xs text-cyan-400 mt-2">{progress}</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">User</p>
            <p className="text-sm">{prompt || 'generate image of a person dancing'}</p>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-y-auto p-6">
          {generatedImageUrl ? (
            <div className="max-w-2xl">
              <p className="text-xs text-white/50 mb-2">Model</p>
              <p className="text-sm mb-4">Absolutely! Here's an image of a person dancing:</p>

              <div className="relative group">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="w-full rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-black/80 hover:bg-black rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  👍
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  👎
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Enter a prompt and click Run to generate an image</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-80 border-l border-white/10 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">{models.find(m => m.id === selectedModel)?.name}</h3>
          <p className="text-xs text-white/50 mt-1 whitespace-pre-line">
            {models.find(m => m.id === selectedModel)?.description}
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Temperature */}
          <div>
            <label className="text-sm font-medium block mb-2">Temperature</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>0</span>
              <span>{temperature}</span>
              <span>2</span>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-sm font-medium block mb-2">Aspect ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400/50"
            >
              {aspectRatios.map(ratio => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Settings */}
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer select-none">
              Advanced settings
            </summary>
            <div className="mt-4 space-y-4 text-sm text-white/70">
              <p>Additional settings coming soon...</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
