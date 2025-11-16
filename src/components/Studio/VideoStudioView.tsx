import React, { useState } from 'react';
import { Video, Play, X, Sparkles } from 'lucide-react';

interface VideoStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({ initialModel = 'veo-2', onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(8);
  const [frameRate, setFrameRate] = useState(24);
  const [resolution, setResolution] = useState('720p');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showToast, setShowToast] = useState(true);

  const exampleVideos = [
    {
      id: 1,
      title: 'Animate an image',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: '"Create a video with an image: a cute creature with snow leopard-like fur is walking in a winter forest."',
      image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: '"Create a video showing some he sprinkling salt into a pan of stir-fr"',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
    },
  ];

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

        {/* Top Center - Playground Title */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-medium">Playground</span>
          <span className="text-sm text-white/50">9/10 generations</span>
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

          {/* Bottom Info */}
          <div className="mt-auto pt-8">
            <p className="text-xs text-white/50">
              Verify AI generated content with<br />
              <span className="text-blue-400">SynthID</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toast Notification */}
          {showToast && (
            <div className="mx-6 mt-4 p-3 bg-white/10 border border-white/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium">Ready to chat!</p>
                  <p className="text-xs text-white/70">Selected Veo 2</p>
                </div>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Center Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-black flex flex-col items-center justify-center">
            <div className="max-w-5xl w-full">
              <h1 className="text-4xl font-normal text-center mb-12">Generate videos with Veo</h1>

              {/* Example Videos Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {exampleVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 mb-2">
                      <img
                        src={video.image}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 group-hover:text-white transition-colors line-clamp-2">
                      {video.title}
                    </p>
                  </div>
                ))}
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
                placeholder="Describe your video"
                className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => setGenerating(!generating)}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Run
                    <span className="text-sm opacity-70">Ctrl ⏎</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="w-80 border-l border-white/10 p-6 overflow-y-auto bg-[#1a1a1a]">
          <h3 className="text-base font-medium mb-2">Veo 2</h3>
          <p className="text-xs text-white/50 mb-6">
            veo-2.0-generate-001<br />
            Our state-of-the-art video generation model, available to developers on the paid tier of the Gemini API.
          </p>

          {/* Number of Results */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Number of results</label>
            <input
              type="number"
              defaultValue={1}
              min={1}
              max={4}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Aspect Ratio */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Aspect ratio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-blue-600/20 border-blue-600 text-white'
                    : 'bg-[#2a2a2a] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-7 border-2 rounded ${aspectRatio === '16:9' ? 'border-blue-600' : 'border-current'}`}></div>
                <span className="text-xs">16:9</span>
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-blue-600/20 border-blue-600 text-white'
                    : 'bg-[#2a2a2a] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className={`w-7 h-12 border-2 rounded ${aspectRatio === '9:16' ? 'border-blue-600' : 'border-current'}`}></div>
                <span className="text-xs">9:16</span>
              </button>
            </div>
          </div>

          {/* Video Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Video duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            >
              <option value={2}>2s</option>
              <option value={5}>5s</option>
              <option value={8}>8s</option>
              <option value={10}>10s</option>
              <option value={20}>20s</option>
            </select>
          </div>

          {/* Frame Rate */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Frame rate</label>
            <select
              value={frameRate}
              onChange={(e) => setFrameRate(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            >
              <option value={24}>24 fps</option>
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>

          {/* Output Resolution */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Output resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p (Full HD)</option>
              <option value="4k">4K (Ultra HD)</option>
            </select>
          </div>

          {/* Negative Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Negative prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid in the video..."
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 resize-none"
              rows={4}
            />
          </div>

          {/* Bottom Note */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/50">
              Content from previous turns is not referenced in new requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
