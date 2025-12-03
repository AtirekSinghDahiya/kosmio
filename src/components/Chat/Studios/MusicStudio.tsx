import React, { useState, useEffect } from 'react';
import { Music, X, Loader, Download, Play, Pause, Sparkles, Plus, Volume2 } from 'lucide-react';
import { generateSunoMusic } from '../../../lib/sunoService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';
import { supabase } from '../../../lib/supabase';

interface MusicStudioProps {
  onClose: () => void;
}

type MusicMode = 'simple' | 'custom';

export const MusicStudio: React.FC<MusicStudioProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [mode, setMode] = useState<MusicMode>('simple');
  const [description, setDescription] = useState('');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeLyrics, setIncludeLyrics] = useState(true);
  const [instrumental, setInstrumental] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongs, setGeneratedSongs] = useState<Array<{ audioUrl: string; title: string; tags?: string }>>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState('');
  const [limitInfo, setLimitInfo] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState(0);

  const inspirationGenres = [
    'lo-fi',
    'pop rock',
    'country',
    'folk song',
    'electronic',
    'hip-hop',
    'jazz',
    'classical',
    'r&b',
    'blues'
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tokens_balance')
      .eq('id', user.uid)
      .maybeSingle();

    if (profile) {
      setTokenBalance(profile.tokens_balance || 0);
    }

    const limit = await checkGenerationLimit(user.uid, 'song');
    setLimitInfo(getGenerationLimitMessage('song', limit.isPaid, limit.current, limit.limit));
  };

  const toggleInspiration = (genre: string) => {
    setSelectedInspiration(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      showToast('error', 'Empty Description', 'Please describe the music you want to create');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate music');
      return;
    }

    setIsGenerating(true);

    const genre = selectedInspiration.join(', ');

    const result = await executeGeneration({
      userId: user.uid,
      generationType: 'song',
      modelId: 'suno-ai',
      provider: 'suno',
      onProgress: setProgress
    }, async () => {
      return await generateSunoMusic({
        description,
        genre: genre || undefined,
        title: undefined
      }, setProgress);
    });

    if (result.success && result.data) {
      setGeneratedSongs(prev => [result.data!, ...prev]);
      showToast('success', 'Music Generated!', 'Your song is ready to play');
      await loadData();
    } else if (result.limitReached) {
      showToast('error', 'Limit Reached', result.error || 'Generation limit exceeded');
    } else if (result.insufficientTokens) {
      showToast('error', 'Insufficient Tokens', result.error || 'Not enough tokens');
    } else {
      showToast('error', 'Generation Failed', result.error || 'Failed to generate music');
    }

    setIsGenerating(false);
    setProgress('');
  };

  const handleDownload = (song: { audioUrl: string; title: string }, index: number) => {
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded!', 'Audio file downloaded');
  };

  const togglePlay = (index: number) => {
    const audio = document.getElementById(`audio-player-${index}`) as HTMLAudioElement;
    if (audio) {
      if (currentlyPlaying === index) {
        audio.pause();
        setCurrentlyPlaying(null);
      } else {
        if (currentlyPlaying !== null) {
          const prevAudio = document.getElementById(`audio-player-${currentlyPlaying}`) as HTMLAudioElement;
          if (prevAudio) prevAudio.pause();
        }
        audio.play();
        setCurrentlyPlaying(index);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Top Header */}
      <div className="relative border-b border-white/10 bg-black">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Music count and mode tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
              <Music className="w-4 h-4" />
              <span className="text-sm font-semibold">{generatedSongs.length}</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setMode('simple')}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${
                  mode === 'simple'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${
                  mode === 'custom'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Center: Version selector (placeholder) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <button className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all">
              v4.5-all
            </button>
          </div>

          {/* Right: Workspace, tokens, close */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/50">
              <span className="text-white/70">Workspaces</span>
              <span className="mx-2">›</span>
              <span>My Workspace</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">{tokenBalance.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-lg transition-all"
              title="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[420px] border-r border-white/10 flex flex-col bg-black">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Song Description */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white">Song Description</label>
                <button className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hip-hop, R&B, upbeat"
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 focus:border-white/30 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
                disabled={isGenerating}
              />
            </div>

            {/* Audio and Lyrics toggles */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIncludeAudio(!includeAudio)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  includeAudio
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Audio</span>
              </button>

              <button
                onClick={() => setIncludeLyrics(!includeLyrics)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  includeLyrics
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Lyrics</span>
              </button>

              <button
                onClick={() => setInstrumental(!instrumental)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  instrumental
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                Instrumental
              </button>
            </div>

            {/* Inspiration */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Inspiration</label>
              <div className="flex flex-wrap gap-2">
                {inspirationGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleInspiration(genre)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      selectedInspiration.includes(genre)
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="mr-1.5">+</span>
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Info */}
            {limitInfo && (
              <div className="text-xs text-white/40">
                {limitInfo}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleCreate}
              disabled={isGenerating || !description.trim()}
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  <span>Create</span>
                </>
              )}
            </button>

            {isGenerating && progress && (
              <p className="text-xs text-white/40 text-center mt-3">{progress}</p>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-black">
          {/* Search and Filters Bar */}
          <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all">
                  Filters (3)
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all">
                  Newest
                </button>
                <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                  ‹
                </button>
                <span className="text-sm text-white/50">1</span>
                <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Songs Grid */}
          <div className="p-6">
            {generatedSongs.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-white/50 mb-2">No songs found</p>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-all">
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedSongs.map((song, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1 line-clamp-1">{song.title}</h3>
                        {song.tags && (
                          <p className="text-xs text-white/50 line-clamp-1">{song.tags}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(song, index)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <audio
                      id={`audio-player-${index}`}
                      src={song.audioUrl}
                      onEnded={() => setCurrentlyPlaying(null)}
                      className="hidden"
                    />

                    <button
                      onClick={() => togglePlay(index)}
                      className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      {currentlyPlaying === index ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {currentlyPlaying === index ? 'Pause' : 'Play'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Player (Optional) */}
      {currentlyPlaying !== null && generatedSongs[currentlyPlaying] && (
        <div className="border-t border-white/10 bg-black px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => togglePlay(currentlyPlaying)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <Pause className="w-5 h-5" />
              </button>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {generatedSongs[currentlyPlaying].title}
                </h4>
                {generatedSongs[currentlyPlaying].tags && (
                  <p className="text-xs text-white/50">
                    {generatedSongs[currentlyPlaying].tags}
                  </p>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
