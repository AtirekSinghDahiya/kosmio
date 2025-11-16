import React, { useState } from 'react';
import { Image, Play, ChevronDown, Sparkles } from 'lucide-react';

interface ImageStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({ initialModel = 'gemini-2.5-flash-image', onBack }) => {
  const [prompt, setPrompt] = useState('Generate an image of a banana wearing a costume.');
  const [model, setModel] = useState(initialModel);
  const [temperature, setTemperature] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [outputLength, setOutputLength] = useState(32768);
  const [topP, setTopP] = useState(0.95);
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // TODO: Call actual image generation API
    setTimeout(() => {
      setGenerating(false);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Google AI Studio</span>
          </div>
        </div>

        {/* Top Center Tabs */}
        <div className="flex items-center gap-6 text-sm">
          <button className="text-white/50 hover:text-white transition-colors">Featured</button>
          <button className="text-white/50 hover:text-white transition-colors">Gemini</button>
          <button className="text-white/50 hover:text-white transition-colors">• Live</button>
          <button className="text-white font-medium border-b-2 border-white pb-2">Images</button>
          <button className="text-white/50 hover:text-white transition-colors">Video</button>
          <button className="text-white/50 hover:text-white transition-colors">Audio</button>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 text-sm hover:bg-white/5 rounded transition-colors">
            Run settings
          </button>
          <button className="px-4 py-1.5 text-sm hover:bg-white/5 rounded transition-colors">
            Get code
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 p-4 overflow-y-auto bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h3 className="text-sm font-medium">Playground</h3>
          </div>

          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded transition-colors">
              A Person Dancing
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded transition-colors">
              Person Flying On Broom
            </button>
          </div>

          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300">
            View all history →
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Title Bar */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div>
                  <h2 className="text-base font-medium">Untitled prompt</h2>
                  <p className="text-xs text-white/50">11 tokens</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Content Area */}
          <div className="flex-1 flex items-center justify-center p-12 bg-black overflow-y-auto">
            <div className="text-center max-w-2xl">
              <h1 className="text-5xl font-normal mb-8">Google AI Studio</h1>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gemini 2.5 Flash Native Audio Preview 09-2025</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">New</span>
                </div>
                <p className="mt-3 text-sm text-white/50">
                  Our native audio models optimized for higher quality audio outputs with better pacing,
                  voice naturalness, verbosity, and mood.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Input Bar */}
          <div className="border-t border-white/10 p-4 bg-[#1a1a1a]">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                placeholder="Generate an image of a banana wearing a costume."
                className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                disabled={generating}
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="px-6 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <span>Run</span>
                )}
                <span className="text-sm">Ctrl ⏎</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="w-80 border-l border-white/10 p-6 overflow-y-auto bg-[#1a1a1a]">
          <h3 className="text-base font-medium mb-4">Nano Banana</h3>
          <p className="text-xs text-white/50 mb-6">gemini-2.5-flash-image<br />State-of-the-art image generation and editing model.</p>

          {/* System Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">System instructions</label>
            <textarea
              placeholder="Optional tone and style instructions for the model"
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 resize-none"
              rows={3}
            />
          </div>

          {/* Temperature */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-white/70">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Aspect Ratio */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Aspect ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
            >
              <option value="auto">Auto</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
            </select>
          </div>

          {/* Advanced Settings */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-3 border-t border-white/10 text-sm font-medium"
          >
            <span>Advanced settings</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-6">
              <div>
                <button className="text-sm text-white/70 hover:text-white mb-2">Add stop sequence</button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Output length</label>
                  <span className="text-sm text-white/70">{outputLength}</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="65536"
                  step="1024"
                  value={outputLength}
                  onChange={(e) => setOutputLength(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Top P</label>
                  <span className="text-sm text-white/70">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
