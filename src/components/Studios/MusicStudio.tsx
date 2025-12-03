/**
 * KroniQ Music Generation Studio
 * Professional interface for AI music composition
 */

import React, { useState } from 'react';
import { Music, Play, Download, Loader, Sparkles, Pause } from 'lucide-react';
import { generateSunoMusic } from '../../lib/sunoMusicService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { checkGenerationLimit, incrementGenerationCount } from '../../lib/generationLimitsService';

export const MusicStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Settings
  const [duration, setDuration] = useState(60);
  const [instrumental, setInstrumental] = useState(false);
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');

  const genres = [
    'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'Classical', 'R&B', 'Country', 'Indie', 'Latin'
  ];

  const moods = [
    'Happy', 'Energetic', 'Calm', 'Sad', 'Dramatic', 'Romantic', 'Mysterious', 'Epic'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() && !genre && !mood) {
      showToast('error', 'Empty Prompt', 'Please describe the music you want to generate');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate music');
      return;
    }

    const limitCheck = await checkGenerationLimit(user.uid, 'music');
    if (!limitCheck.canGenerate) {
      showToast('error', 'Generation Limit Reached', limitCheck.message);
      return;
    }

    setIsGenerating(true);
    setGeneratedMusicUrl(null);
    setProgress('Composing your music...');

    try {
      const fullPrompt = [prompt, genre, mood].filter(Boolean).join(' ');

      const musicUrl = await generateSunoMusic({
        prompt: fullPrompt,
        duration,
        makeInstrumental: instrumental
      });

      setGeneratedMusicUrl(musicUrl);

      await incrementGenerationCount(user.uid, 'music');

      showToast('success', 'Music Generated!', 'Your track is ready to listen');
      setProgress('');
    } catch (error: any) {
      console.error('Music generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate music');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedMusicUrl) {
      const link = document.createElement('a');
      link.href = generatedMusicUrl;
      link.download = `kroniq-music-${Date.now()}.mp3`;
      link.click();
    }
  };

  const togglePlay = () => {
    const audio = document.getElementById('music-player') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Input */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-400" />
            <h2 className="text-sm font-semibold">Music Generator</h2>
          </div>
          <p className="text-xs text-white/50 mt-1">Create original tracks</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/70 block mb-2">Describe your music</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A peaceful acoustic guitar melody with soft vocals..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-400/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400/50"
              >
                <option value="">Select genre</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-2">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400/50"
              >
                <option value="">Select mood</option>
                {moods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                min="15"
                max="180"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-white/70">Instrumental only</label>
              <button
                onClick={() => setInstrumental(!instrumental)}
                className={`w-12 h-6 rounded-full transition-all ${
                  instrumental ? 'bg-pink-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  instrumental ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim() && !genre && !mood)}
            className="w-full mt-6 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Generate
              </>
            )}
          </button>

          {isGenerating && progress && (
            <p className="text-xs text-pink-400 mt-2">{progress}</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4">
          <h1 className="text-lg font-semibold">Music Generation Studio</h1>
          <p className="text-sm text-white/60">Create AI-powered original music tracks</p>
        </div>

        {/* Music Player */}
        <div className="flex-1 flex items-center justify-center p-6">
          {generatedMusicUrl ? (
            <div className="w-full max-w-2xl">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center animate-pulse">
                    <Music className="w-24 h-24 text-white" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Your Generated Track</h3>
                  <p className="text-sm text-white/60">
                    {prompt.substring(0, 80) || `${genre} ${mood} music`.trim()}
                  </p>
                </div>

                <div className="space-y-4">
                  <audio
                    id="music-player"
                    src={generatedMusicUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                  />

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 justify-center">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    👍
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    👎
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your Music</h3>
              <p className="text-white/50 max-w-md">
                Describe the music you want to generate, choose a genre and mood, then hit Generate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Info */}
      <div className="w-80 border-l border-white/10 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">Suno AI Music</h3>
          <p className="text-xs text-white/50 mt-1">
            Advanced AI music generation with vocals and instruments
          </p>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Quick Tips</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• Be specific about instruments and style</li>
              <li>• Describe the emotional tone clearly</li>
              <li>• Mention tempo (fast, slow, moderate)</li>
              <li>• Add context (e.g., "background music for...")</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Popular Styles</h4>
            <div className="flex flex-wrap gap-2">
              {['Lofi', 'Cinematic', 'Ambient', 'EDM', 'Acoustic', 'Orchestral'].map(style => (
                <button
                  key={style}
                  onClick={() => setGenre(style)}
                  className="px-3 py-1 bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-400/30 rounded-full text-xs transition-all"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Example Prompts</h4>
            <div className="space-y-2">
              {[
                'Upbeat electronic dance track with synthesizers',
                'Peaceful piano melody with rain sounds',
                'Epic orchestral soundtrack with drums',
                'Chill lofi hip hop beat for studying'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-400/30 rounded-lg text-xs transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
