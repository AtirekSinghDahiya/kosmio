/**
 * KroniQ Text-to-Speech Studio
 * Professional interface for voice synthesis
 */

import React, { useState } from 'react';
import { Mic, Play, Download, Loader, Volume2, User } from 'lucide-react';
import { generateVoiceover } from '../../lib/voiceoverService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { checkGenerationLimit, incrementGenerationCount } from '../../lib/generationLimitsService';

interface Speaker {
  id: string;
  name: string;
  voice: string;
  text: string;
}

export const TTSStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [mode, setMode] = useState<'single' | 'multi'>('multi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const [speakers, setSpeakers] = useState<Speaker[]>([
    {
      id: '1',
      name: 'Speaker 1',
      voice: 'Zephyr',
      text: "Hello! We're excited to show you our native speech capabilities"
    },
    {
      id: '2',
      name: 'Speaker 2',
      voice: 'Aria',
      text: "Where you can direct a voice, create realistic dialog, and so much more. Edit these placeholders to get started."
    }
  ]);

  const voices = [
    'Zephyr', 'Aria', 'Nova', 'Echo', 'Kai', 'Luna', 'Atlas', 'Sage'
  ];

  const handleGenerate = async () => {
    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate speech');
      return;
    }

    const limitCheck = await checkGenerationLimit(user.uid, 'tts');
    if (!limitCheck.canGenerate) {
      showToast('error', 'Generation Limit Reached', limitCheck.message);
      return;
    }

    setIsGenerating(true);
    setGeneratedAudioUrl(null);
    setProgress('Generating speech...');

    try {
      const combinedText = speakers.map(s => s.text).join(' ');

      const audioBlob = await generateVoiceover({
        text: combinedText,
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default voice
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudioUrl(audioUrl);

      await incrementGenerationCount(user.uid, 'tts');

      showToast('success', 'Speech Generated!', 'Your audio has been created');
      setProgress('');
    } catch (error: any) {
      console.error('TTS generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate speech');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, {
      id: Date.now().toString(),
      name: `Speaker ${speakers.length + 1}`,
      voice: 'Zephyr',
      text: ''
    }]);
  };

  const updateSpeaker = (id: string, field: keyof Speaker, value: string) => {
    setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSpeaker = (id: string) => {
    if (speakers.length > 1) {
      setSpeakers(speakers.filter(s => s.id !== id));
    }
  };

  const handleDownload = () => {
    if (generatedAudioUrl) {
      const link = document.createElement('a');
      link.href = generatedAudioUrl;
      link.download = `kroniq-speech-${Date.now()}.mp3`;
      link.click();
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Left Sidebar - Navigation */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-green-400" />
            <h2 className="text-sm font-semibold">Playground</h2>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
            Raw structure
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg bg-white/10 text-sm font-medium">
            Script builder
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 p-4">
          <h1 className="text-lg font-semibold">Playground</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            {/* Instructions Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Style instructions</h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-white/70">Read aloud in a warm, welcoming tone</p>
              </div>
            </div>

            {/* Speakers */}
            <div className="space-y-4">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-sm font-medium">{speaker.name}</span>
                  </div>

                  <textarea
                    value={speaker.text}
                    onChange={(e) => updateSpeaker(speaker.id, 'text', e.target.value)}
                    placeholder="Enter text for this speaker..."
                    className="w-full h-20 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-400/50"
                  />
                </div>
              ))}

              <button
                onClick={addSpeaker}
                className="w-full py-3 border border-dashed border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70"
              >
                + Add dialog
              </button>
            </div>

            {/* Generated Audio Player */}
            {generatedAudioUrl && (
              <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Generated Audio</h3>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <audio src={generatedAudioUrl} controls className="w-full" />
              </div>
            )}

            {/* Bottom Templates */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <button className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-left">
                <Volume2 className="w-5 h-5 mb-2 text-green-400" />
                <p className="text-sm font-medium">Audio voice assistant</p>
              </button>
              <button className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-left">
                <Play className="w-5 h-5 mb-2 text-blue-400" />
                <p className="text-sm font-medium">Movie scene script</p>
              </button>
              <button className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-left">
                <Mic className="w-5 h-5 mb-2 text-purple-400" />
                <p className="text-sm font-medium">Podcast transcript</p>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-white/10 p-4">
          <div className="max-w-4xl flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || speakers.every(s => !s.text.trim())}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
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
          </div>
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-80 border-l border-white/10 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold">Gemini 2.5 Flash Preview TTS</h3>
          <p className="text-xs text-white/50 mt-1">
            gemini-2.5-flash-preview-tts
            <br />
            Our 2.5 Flash text-to-speech audio model optimized for price-performant, low-latency, controllable speech generation.
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="text-sm font-medium block mb-2">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('single')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                  mode === 'single'
                    ? 'bg-green-500/20 border-green-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs block">Single-speaker audio</span>
              </button>
              <button
                onClick={() => setMode('multi')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                  mode === 'multi'
                    ? 'bg-green-500/20 border-green-400 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <User className="w-4 h-4" />
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs block">Multi-speaker audio</span>
              </button>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Voice settings</h4>

            {speakers.map((speaker, index) => (
              <details key={speaker.id} className="group" open={index === 0}>
                <summary className="cursor-pointer select-none p-3 bg-white/5 rounded-lg text-sm font-medium">
                  <span className="text-green-400">●</span> {speaker.name} settings
                </summary>
                <div className="mt-2 p-3 space-y-3">
                  <div>
                    <label className="text-xs text-white/70 block mb-1">Name</label>
                    <input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(speaker.id, 'name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 block mb-1">Voice</label>
                    <select
                      value={speaker.voice}
                      onChange={(e) => updateSpeaker(speaker.id, 'voice', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-400/50"
                    >
                      {voices.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Model Settings */}
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer select-none">
              Model settings
            </summary>
            <div className="mt-4 space-y-4 text-sm text-white/70">
              <p>Additional model configuration options...</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
