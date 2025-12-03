/**
 * KroniQ Video Generation Studio
 * Professional interface for AI video creation
 */

import React, { useState } from 'react';
import { Video, Play, Download, Loader, Sparkles } from 'lucide-react';
import { generateWithVeo3 } from '../../lib/googleVeo3Service';
import { generateWithVeo2 } from '../../lib/veo2Service';
import { generateWithSora2 } from '../../lib/openaiSora2Service';
import { generateWithHailuo } from '../../lib/minimaxHailuoService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveVideoToProject } from '../../lib/contentSaveService';
import { checkGenerationLimit, incrementGenerationCount } from '../../lib/generationLimitsService';
import { deductTokensForRequest } from '../../lib/tokenService';
import { getModelCost } from '../../lib/modelTokenPricing';

export const VideoStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  // Settings
  const [selectedModel, setSelectedModel] = useState('veo-2');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<4 | 6 | 8>(8);
  const [frameRate, setFrameRate] = useState(24);
  const [resolution, setResolution] = useState('720p');
  const [negativePrompt, setNegativePrompt] = useState('');

  const models = [
    {
      id: 'veo-2',
      name: 'Veo 2',
      description: 'veo-2.0-generate-001\nOur 2nd-gen video generation model, available to developers on the paid tier of the Gemini API.'
    },
    {
      id: 'veo-3',
      name: 'Veo 3',
      description: 'Latest Google video generation model with advanced capabilities'
    },
    {
      id: 'sora-2',
      name: 'Sora 2',
      description: 'OpenAI\'s advanced video generation model'
    },
    {
      id: 'hailuo',
      name: 'Hailuo',
      description: 'MiniMax video generation with high quality output'
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please enter a description for your video');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate videos');
      return;
    }

    const limitCheck = await checkGenerationLimit(user.uid, 'video');
    if (!limitCheck.canGenerate) {
      showToast('error', 'Generation Limit Reached', limitCheck.message);
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setProgress('Starting generation...');

    try {
      let videoUrl: string;

      if (selectedModel === 'veo-2') {
        videoUrl = await generateWithVeo2(
          { prompt },
          (status) => setProgress(status)
        );
      } else if (selectedModel === 'veo-3') {
        videoUrl = await generateWithVeo3(
          { prompt, aspectRatio: aspectRatio === '16:9' ? 'landscape' : 'portrait', duration, resolution: '1080p' },
          (status) => setProgress(status)
        );
      } else if (selectedModel === 'hailuo') {
        videoUrl = await generateWithHailuo(
          { prompt, duration, resolution: '768P' },
          (status) => setProgress(status)
        );
      } else {
        videoUrl = await generateWithSora2(
          { prompt, aspectRatio: aspectRatio === '16:9' ? 'landscape' : 'portrait', duration, resolution: '1080p' },
          (status) => setProgress(status)
        );
      }

      setGeneratedVideoUrl(videoUrl);

      const modelCost = getModelCost(selectedModel);
      const providerMap: Record<string, string> = {
        'veo-2': 'veo-2',
        'veo-3': 'google-veo',
        'sora-2': 'openai-sora',
        'hailuo': 'minimax-hailuo'
      };
      const provider = providerMap[selectedModel];
      await deductTokensForRequest(user.uid, selectedModel, provider, modelCost.costPerMessage, 'video');
      await incrementGenerationCount(user.uid, 'video');

      await saveVideoToProject(user.uid, prompt, videoUrl, {
        model: selectedModel,
        dimensions: aspectRatio,
        duration,
        provider
      });

      showToast('success', 'Video Generated!', 'Your video has been created and saved');
      setProgress('');
    } catch (error: any) {
      console.error('Video generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate video');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `kroniq-video-${Date.now()}.mp4`;
      link.click();
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Prompt Input */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-semibold">Person Dancing Video</h2>
          </div>
          <p className="text-xs text-white/50 mt-1">4/10 generations</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="video of a person dancing"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-400/50"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full mt-4 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>

          {isGenerating && progress && (
            <p className="text-xs text-purple-400 mt-2">{progress}</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-white/50">User</p>
            <p className="text-sm">{prompt || 'video of a person dancing'}</p>
            <p className="text-xs text-white/50 mt-1">Veo 2 • 48.4s</p>
          </div>
        </div>

        {/* Video Display */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          {generatedVideoUrl ? (
            <div className="max-w-3xl w-full">
              <div className="relative group aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={generatedVideoUrl}
                  controls
                  className="w-full h-full"
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
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">Enter a prompt and click Run to generate a video</p>
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
          {/* Number of Results */}
          <div>
            <label className="text-sm font-medium block mb-2">Number of results</label>
            <input
              type="range"
              min="1"
              max="1"
              value="1"
              className="w-full"
              disabled
            />
            <p className="text-xs text-white/50 mt-1">1</p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-sm font-medium block mb-2">Aspect ratio</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-500/20 border-purple-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">▭</div>
                  <div className="text-xs">16:9</div>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-500/20 border-purple-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">▯</div>
                  <div className="text-xs">9:16</div>
                </div>
              </button>
            </div>
          </div>

          {/* Video Duration */}
          <div>
            <label className="text-sm font-medium block mb-2">Video duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) as any)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50"
            >
              <option value="4">4s</option>
              <option value="6">6s</option>
              <option value="8">8s</option>
            </select>
          </div>

          {/* Frame Rate */}
          <div>
            <label className="text-sm font-medium block mb-2">Frame rate</label>
            <select
              value={frameRate}
              onChange={(e) => setFrameRate(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50"
            >
              <option value="24">24 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>

          {/* Output Resolution */}
          <div>
            <label className="text-sm font-medium block mb-2">Output resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="text-sm font-medium block mb-2">Negative prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Elements to avoid..."
              className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-400/50"
            />
            <p className="text-xs text-white/50 mt-1">Content from previous turns is not included.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
