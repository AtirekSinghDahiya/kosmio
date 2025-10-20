import React, { useState, useEffect } from 'react';
import { Music, Loader2, Download, X } from 'lucide-react';
import { generateAndWaitForMusic } from '../../lib/sunoService';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';

interface MusicGeneratorProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({ onClose, initialPrompt = '' }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<Array<{ audioUrl: string; title: string }>>([]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      setTitle(initialPrompt.substring(0, 80));
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !style.trim() || !title.trim()) {
      showToast('warning', 'Missing Fields', 'Please fill in prompt, style, and title');
      return;
    }

    const apiKey = import.meta.env.VITE_SUNO_API_KEY;
    if (!apiKey) {
      showToast('error', 'Configuration Error', 'Music generation is not configured. Please contact support.');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedTracks([]);
      setProgressMessage('Starting music generation...');

      const tracks = await generateAndWaitForMusic(
        {
          prompt,
          style,
          title,
          customMode: true,
          instrumental: false,
          model: 'V3_5',
        },
        apiKey,
        (status) => setProgressMessage(status)
      );

      setGeneratedTracks(tracks);
      showToast('success', 'Success!', 'Music generated successfully!');
    } catch (error: any) {
      console.error('Suno generation error:', error);

      let errorMessage = 'Failed to generate music';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Check for specific error types
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        errorMessage = 'Invalid API key. Please check your KIE.ai API key.';
      } else if (error?.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      showToast('error', 'Generation Failed', errorMessage);
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  const handleDownload = async (url: string, trackTitle: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${trackTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      showToast('success', 'Downloaded', 'Music downloaded successfully!');
    } catch (error) {
      showToast('error', 'Download Failed', 'Failed to download music');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-scale-in ${
        theme === 'light'
          ? 'bg-white border border-gray-200'
          : 'bg-slate-900/95 backdrop-blur-xl border border-white/20'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === 'light' ? 'border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50' : 'border-white/10 bg-gradient-to-r from-violet-500/10 to-purple-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>AI Music Generator</h2>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>Powered by Suno V3.5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'light'
                ? 'hover:bg-gray-200 text-gray-700'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
          {/* Music Description */}
          <div>
            <label className={`block font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>
              Music Description <span className={theme === 'light' ? 'text-red-600' : 'text-red-400'}>*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to create (e.g., 'A calm and relaxing piano track with soft melodies')"
              maxLength={3000}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-violet-500'
                  : 'bg-slate-800/50 border-white/10 text-white placeholder-white/30 focus:ring-violet-500'
              }`}
            />
            <div className={`text-right text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
              {prompt.length}/3000
            </div>
          </div>

          {/* Style/Genre */}
          <div>
            <label className={`block font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>
              Style/Genre <span className={theme === 'light' ? 'text-red-600' : 'text-red-400'}>*</span>
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g., Classical, Jazz, Pop, Electronic, Rock"
              maxLength={200}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-violet-500'
                  : 'bg-slate-800/50 border-white/10 text-white placeholder-white/30 focus:ring-violet-500'
              }`}
            />
          </div>

          {/* Title */}
          <div>
            <label className={`block font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>
              Title <span className={theme === 'light' ? 'text-red-600' : 'text-red-400'}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Peaceful Piano Meditation"
              maxLength={80}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-violet-500'
                  : 'bg-slate-800/50 border-white/10 text-white placeholder-white/30 focus:ring-violet-500'
              }`}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-violet-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Music...
              </>
            ) : (
              <>
                <Music className="w-5 h-5" />
                Generate Music
              </>
            )}
          </button>

          {/* Progress Message */}
          {progressMessage && (
            <div className={`text-center animate-pulse ${theme === 'light' ? 'text-violet-600' : 'text-violet-400'}`}>
              {progressMessage}
            </div>
          )}

          {/* Generated Tracks */}
          {generatedTracks.length > 0 && (
            <div className={`rounded-xl p-4 space-y-3 border ${
              theme === 'light'
                ? 'bg-gray-50 border-gray-200'
                : 'bg-slate-800/50 border-white/10'
            }`}>
              <h3 className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                <Music className="w-5 h-5 text-violet-500" />
                Generated Tracks
              </h3>

              <div className="space-y-3">
                {generatedTracks.map((track, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 flex items-center justify-between ${
                      theme === 'light' ? 'bg-white border border-gray-200' : 'bg-slate-700/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <audio
                        src={track.audioUrl}
                        controls
                        className="w-full mt-2"
                      />
                    </div>

                    <button
                      onClick={() => handleDownload(track.audioUrl, track.title)}
                      className="ml-3 p-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className={`rounded-xl p-4 border ${
            theme === 'light'
              ? 'bg-gray-50 border-gray-200'
              : 'bg-slate-800/50 border-white/10'
          }`}>
            <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Tips</h3>
            <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>
              <li>• Be detailed in your prompt - include emotions, rhythm, instruments</li>
              <li>• Specify the genre or style clearly</li>
              <li>• Generation typically takes 1-3 minutes</li>
              <li>• Each generation produces 2 unique variations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
