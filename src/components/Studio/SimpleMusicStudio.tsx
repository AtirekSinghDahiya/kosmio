import React, { useState } from 'react';
import { X, Music, Loader, Play, Download } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';

interface SimpleMusicStudioProps {
  onBack?: () => void;
}

export const SimpleMusicStudio: React.FC<SimpleMusicStudioProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [duration, setDuration] = useState<30 | 60 | 120>(30);
  const [musicType, setMusicType] = useState<'vocals' | 'instrumental'>('vocals');
  const [audioMode, setAudioMode] = useState<'music' | 'speech'>('music');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please describe the music you want to create');
      return;
    }

    setIsGenerating(true);
    setGeneratedAudio(null);
    setProgress('Starting music generation...');

    try {
      // This will use your existing Suno service
      // For now, showing UI - you'll need to wire up the actual API
      showToast('info', 'Coming Soon', 'Music generation is being set up');

      setTimeout(() => {
        setIsGenerating(false);
        showToast('error', 'Not Available', 'Music generation API needs to be configured');
      }, 2000);

    } catch (error: any) {
      console.error('Music generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate music');
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Music className="w-5 h-5 text-pink-400" />
          <h1 className="text-lg font-semibold text-white">KroniQ Audio Studio</h1>
          <p className="text-sm text-white/40">Generate AI-powered music</p>
        </div>
        <button
          onClick={onBack}
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
              <Loader className="w-16 h-16 animate-spin text-pink-400" />
              <p className="text-white/60">{progress || 'Generating your music...'}</p>
              <p className="text-xs text-white/40">This may take 1-2 minutes</p>
            </div>
          ) : generatedAudio ? (
            <div className="max-w-2xl w-full">
              <audio
                src={generatedAudio}
                controls
                className="w-full mb-4"
              />
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all">
                  <Play className="w-5 h-5" />
                  <span>Play</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Music className="w-16 h-16 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Music preview</h3>
              <p className="text-white/40">
                Your generated music will appear here. Describe the music you want and click generate.
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Controls */}
        <div className="w-[420px] border-l border-white/10 flex flex-col bg-black">
          {/* Mode Selector */}
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Audio Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAudioMode('music')}
                disabled={isGenerating}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  audioMode === 'music'
                    ? 'bg-pink-500/20 border-pink-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Text to Music</span>
              </button>
              <button
                onClick={() => setAudioMode('speech')}
                disabled={isGenerating}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  audioMode === 'speech'
                    ? 'bg-pink-500/20 border-pink-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Text to Speech</span>
              </button>
            </div>
          </div>

          {/* Model Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <span className="text-sm font-semibold text-white">
                {audioMode === 'music' ? 'KroniQ Lyria' : 'KroniQ TTS Pro'}
              </span>
            </div>
            <p className="text-xs text-white/50">
              {audioMode === 'music'
                ? 'AI-powered music generation with real-time control'
                : 'Natural text-to-speech with 30 voice options'}
            </p>
          </div>

          {/* Music Type - Only for Music Mode */}
          {audioMode === 'music' && (
            <div className="p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Music Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMusicType('vocals')}
                disabled={isGenerating}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  musicType === 'vocals'
                    ? 'bg-pink-500/20 border-pink-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>With Vocals</span>
              </button>
              <button
                onClick={() => setMusicType('instrumental')}
                disabled={isGenerating}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  musicType === 'instrumental'
                    ? 'bg-pink-500/20 border-pink-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Instrumental</span>
              </button>
            </div>
            </div>
          )}

          {/* Duration - Only for Music Mode */}
          {audioMode === 'music' && (
          <div className="p-6 border-b border-white/10">
            <label className="text-sm font-medium text-white/80 mb-3 block">Duration: {duration}s</label>
            <div className="grid grid-cols-3 gap-2">
              {([30, 60, 120] as const).map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  disabled={isGenerating}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    duration === dur
                      ? 'bg-pink-500/20 border-pink-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>
          )}

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
                placeholder="Describe the music... e.g., 'Upbeat electronic dance music with energetic beats'"
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 focus:border-pink-500/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
                disabled={isGenerating}
              />
              <div className="absolute bottom-3 right-3 text-xs text-white/30">
                {prompt.length} characters
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  <span>Generate Music</span>
                </>
              )}
            </button>

            {/* Tips */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-xs font-semibold text-white mb-2">Tips</h4>
              <ul className="text-[11px] text-white/50 space-y-1">
                <li>• Describe the genre, mood, and instruments</li>
                <li>• Include tempo: "fast", "slow", "moderate"</li>
                <li>• Add style keywords: "cinematic", "lo-fi", "ambient"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
