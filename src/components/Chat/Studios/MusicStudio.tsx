import React, { useState, useEffect } from 'react';
import {
  Music, Loader, Download, Play, Pause, X, Sparkles, Plus,
  Wand2, Music2, Mic, MicOff
} from 'lucide-react';
import { generateSunoMusic } from '../../../lib/sunoService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';
import { supabase } from '../../../lib/supabase';

interface MusicStudioProps {
  onClose: () => void;
  initialPrompt?: string;
}

export const MusicStudio: React.FC<MusicStudioProps> = ({
  onClose,
  initialPrompt = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [description, setDescription] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{ audioUrl: string; title: string; tags: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState('');
  const [limitInfo, setLimitInfo] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState(0);

  // Music generation settings
  const [mode, setMode] = useState<'simple' | 'custom'>('simple');
  const [audioType, setAudioType] = useState<'audio' | 'lyrics' | 'instrumental'>('audio');
  const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);

  const inspirationTags = [
    'rock', 'trailer music', 'classical', 'smooth drum',
    'pop', 'jazz', 'electronic', 'acoustic',
    'hip-hop', 'country', 'r&b', 'blues'
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

  const handleGenerate = async () => {
    if (!description.trim()) {
      showToast('error', 'Empty Description', 'Please describe the music you want to create');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate music');
      return;
    }

    setIsGenerating(true);
    setGeneratedMusic(null);

    const result = await executeGeneration({
      userId: user.uid,
      generationType: 'song',
      modelId: 'suno-ai',
      provider: 'suno',
      onProgress: setProgress
    }, async () => {
      return await generateSunoMusic({
        description: description + (selectedInspiration.length > 0 ? `, ${selectedInspiration.join(', ')}` : ''),
        genre: selectedInspiration.join(', ') || undefined
      }, setProgress);
    });

    if (result.success && result.data) {
      setGeneratedMusic(result.data);
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

  const handleDownload = () => {
    if (generatedMusic) {
      const link = document.createElement('a');
      link.href = generatedMusic.audioUrl;
      link.download = `${generatedMusic.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Downloaded!', 'Music file downloaded');
    }
  };

  const togglePlay = () => {
    const audio = document.getElementById('music-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleInspiration = (tag: string) => {
    if (selectedInspiration.includes(tag)) {
      setSelectedInspiration(selectedInspiration.filter(t => t !== tag));
    } else {
      setSelectedInspiration([...selectedInspiration, tag]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Top Bar */}
      <div className="relative border-b border-white/10 bg-black">
        <div className="relative flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/20">
              <Music2 className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Music Generation Studio
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold bg-white/10 text-white border border-white/20 rounded-full">
                  AI Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/50 truncate">{limitInfo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/50 leading-none mb-1">Balance</span>
                <span className="text-sm font-bold text-white leading-none">{tokenBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
              <Music className="w-4 h-4 text-white" />
              <span className="text-sm font-medium">{tokenBalance > 999 ? `${Math.floor(tokenBalance/1000)}k` : tokenBalance}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 active:scale-95 rounded-lg transition-all"
              title="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-80 lg:w-96 border-r border-white/10 bg-black flex flex-col overflow-y-auto">
          {/* Credits Display */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">Credits remaining:</span>
              <span className="text-xl font-bold text-white">50</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setMode('simple')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'simple'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'custom'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Song Description */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-white">Song Description</label>
              <button className="p-1.5 hover:bg-white/10 rounded transition-all">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hip-hop, R&B, upbeat"
              className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 focus:border-white/30 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
              disabled={isGenerating}
            />
          </div>

          {/* Audio Type Toggle */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-2">
              <button
                onClick={() => setAudioType('audio')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  audioType === 'audio'
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Audio</span>
              </button>
              <button
                onClick={() => setAudioType('lyrics')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  audioType === 'lyrics'
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Lyrics</span>
              </button>
              <button
                onClick={() => setAudioType('instrumental')}
                className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all ${
                  audioType === 'instrumental'
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <MicOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inspiration Tags */}
          <div className="p-6 flex-1 overflow-y-auto">
            <label className="text-sm font-semibold text-white mb-3 block">Inspiration</label>
            <div className="flex flex-wrap gap-2">
              {inspirationTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInspiration(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedInspiration.includes(tag)
                      ? 'bg-white text-black'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-white/90 disabled:bg-white/5 text-black font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Create</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Content Area - Music Display */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Loader className="w-16 h-16 animate-spin text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white/80 font-medium mb-2">Generating your music...</p>
                  <p className="text-sm text-white/50">{progress || 'Please wait'}</p>
                </div>
              </div>
            ) : generatedMusic ? (
              <div className="max-w-2xl w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{generatedMusic.title}</h3>
                      <p className="text-sm text-white/50">{generatedMusic.tags}</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6 mb-4">
                    <audio
                      id="music-audio"
                      src={generatedMusic.audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-white hover:bg-white/90 text-black rounded-full transition-all"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-2xl px-4">
                <div className="w-40 h-40 mx-auto mb-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
                  <Music2 className="w-20 h-20 text-white/80 relative z-10" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">No songs found</h3>
                <p className="text-base text-white/50 mb-8 max-w-lg mx-auto">
                  Describe your song in the left panel and click Create to generate AI music.
                </p>
                <div className="text-sm text-white/40 mb-4">Try describing:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Upbeat pop with summer vibes',
                    'Cinematic orchestral trailer music',
                    'Chill lo-fi hip-hop beats',
                    'Energetic rock anthem'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setDescription(example)}
                      className="px-4 py-3 text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left"
                    >
                      <span className="text-white mr-2">→</span>
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
