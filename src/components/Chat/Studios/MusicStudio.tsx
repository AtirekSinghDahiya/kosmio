import React, { useState, useEffect } from 'react';
import { Music, Loader, Download, Play, Pause, X } from 'lucide-react';
import { generateSunoMusic } from '../../../lib/sunoService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';

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
  const [genre, setGenre] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{ audioUrl: string; title: string; tags: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState('');
  const [limitInfo, setLimitInfo] = useState<string>('');

  useEffect(() => {
    loadLimitInfo();
  }, [user]);

  const loadLimitInfo = async () => {
    if (!user?.uid) return;
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
        description,
        genre: genre || undefined,
        title: title || undefined
      }, setProgress);
    });

    if (result.success && result.data) {
      setGeneratedMusic(result.data);
      showToast('success', 'Music Generated!', 'Your song is ready to play');
      await loadLimitInfo();
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

  return (
    <div className="h-full flex flex-col bg-black p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-[#FF6B6B]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Music Generation</h1>
            {limitInfo && <p className="text-xs text-white/40">{limitInfo}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Music Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the music you want to create (e.g., 'A calm and relaxing piano track with soft melodies')"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B6B]/50 resize-none"
            rows={4}
            maxLength={3000}
          />
          <div className="text-xs text-white/40 mt-1">{description.length}/3000</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Style/Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Classical, Jazz, Pop, Electronic"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B6B]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Peaceful Piano Meditation"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B6B]/50"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full py-3 px-6 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              Generate Music
            </>
          )}
        </button>
      </div>

      {progress && (
        <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-sm text-[#FF6B6B]">{progress}</p>
        </div>
      )}

      {generatedMusic && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{generatedMusic.title}</h3>
            <p className="text-sm text-white/50">{generatedMusic.tags}</p>
          </div>

          <audio
            id="music-audio"
            src={generatedMusic.audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex gap-3">
            <button
              onClick={togglePlay}
              className="flex-1 py-3 px-6 bg-[#FF6B6B]/20 border border-[#FF6B6B]/50 text-[#FF6B6B] rounded-lg font-medium hover:bg-[#FF6B6B]/30 transition-all flex items-center justify-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="py-3 px-6 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto pt-6">
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Tips</h4>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Be detailed - include emotions, rhythm, instruments</li>
            <li>• Specify the genre or style clearly</li>
            <li>• Generation typically takes 1-3 minutes</li>
            <li>• Each generation produces unique variations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
