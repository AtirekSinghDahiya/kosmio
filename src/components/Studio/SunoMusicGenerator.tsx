import React, { useState } from 'react';
import { Music, Loader2, Play, Download, Sparkles } from 'lucide-react';
import { generateAndWaitForMusic } from '../../lib/sunoService';
import { useToast } from '../../contexts/ToastContext';

export const SunoMusicGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [title, setTitle] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<Array<{ audioUrl: string; title: string }>>([]);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || !style.trim() || !title.trim() || !apiKey.trim()) {
      showToast('Please fill in all fields including your API key', 'error');
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
      showToast('Music generated successfully!', 'success');
    } catch (error) {
      console.error('Suno generation error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to generate music', 'error');
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
      showToast('Music downloaded successfully!', 'success');
    } catch (error) {
      showToast('Failed to download music', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-indigo-900 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Music className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Suno AI Music Generator</h1>
          </div>
          <p className="text-white/60">Generate custom AI music with Suno V3.5</p>
          <a
            href="https://kie.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 text-sm inline-flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            Get your API key at KIE.ai
          </a>
        </div>

        {/* Input Form */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-white/90 font-semibold mb-2">
              API Key
              <span className="text-white/50 font-normal ml-2">(Required)</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your KIE.ai API key"
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-white/90 font-semibold mb-2">
              Music Description (Prompt)
              <span className="text-white/50 font-normal ml-2">(Max 3000 characters)</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to create (e.g., 'A calm and relaxing piano track with soft melodies')"
              maxLength={3000}
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="text-right text-white/40 text-sm mt-1">{prompt.length}/3000</div>
          </div>

          <div>
            <label className="block text-white/90 font-semibold mb-2">
              Style/Genre
              <span className="text-white/50 font-normal ml-2">(Max 200 characters)</span>
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g., Classical, Jazz, Pop, Electronic, Rock"
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-white/90 font-semibold mb-2">
              Title
              <span className="text-white/50 font-normal ml-2">(Max 80 characters)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Peaceful Piano Meditation"
              maxLength={80}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {progressMessage && (
            <div className="text-center text-cyan-400 animate-pulse">
              {progressMessage}
            </div>
          )}
        </div>

        {/* Generated Tracks */}
        {generatedTracks.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-cyan-400" />
              Generated Tracks
            </h3>

            <div className="space-y-3">
              {generatedTracks.map((track, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{track.title}</p>
                    <audio
                      src={track.audioUrl}
                      controls
                      className="w-full mt-2"
                      onPlay={() => setPlayingTrack(index)}
                      onPause={() => setPlayingTrack(null)}
                    />
                  </div>

                  <button
                    onClick={() => handleDownload(track.audioUrl, track.title)}
                    className="ml-4 p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-white">Tips for Best Results</h3>
          <ul className="text-white/70 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Be detailed in your prompt - include emotions, rhythm, instruments, and mood</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Specify the genre or style clearly for better genre matching</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Generation typically takes 1-3 minutes - please be patient</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Each generation produces 2 unique variations of your music</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
