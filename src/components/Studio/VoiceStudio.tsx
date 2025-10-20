import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Loader2, Upload, X, FileAudio, Mic, Music } from 'lucide-react';
import { SunoMusicGenerator } from './SunoMusicGenerator';
import { useTheme } from '../../contexts/ThemeContext';

export const VoiceStudio: React.FC<{ projectId?: string }> = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'voice' | 'music'>('voice');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [stability, setStability] = useState(0.5);
  const [clarity, setClarity] = useState(0.75);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (!selectedVoice) {
          setSelectedVoice(availableVoices[0]);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setUploadedFile(file);
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setIsPlaying(false);
    } else {
      alert('Please upload a valid audio file (MP3, WAV, etc.)');
    }
  };

  const removeUploadedFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setUploadedFile(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate speech');
      return;
    }

    if (!selectedVoice) {
      alert('Please wait for voices to load');
      return;
    }

    setIsGenerating(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = clarity;
      utterance.pitch = stability * 2;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsGenerating(false);
        setUploadedFile(null);
      };

      mediaRecorder.start();

      utterance.onend = () => {
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsGenerating(false);
        alert('Error generating speech. Please try again.');
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error:', error);
      setIsGenerating(false);
      alert('Error generating speech. Your browser may not support this feature.');
    }
  };

  const togglePlayPause = () => {
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error('Playback error:', err);
        alert('Error playing audio');
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadOriginal = () => {
    if (!audioBlob) return;
    setShowDownloadMenu(false);

    const filename = uploadedFile ? uploadedFile.name : 'audio.webm';
    triggerDownload(audioBlob, filename);
  };

  const downloadMP3 = async () => {
    if (!audioBlob) return;
    setShowDownloadMenu(false);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const wavBlob = encodeWAV(audioBuffer);
      triggerDownload(wavBlob, 'audio.mp3');
    } catch (error) {
      console.error('MP3 conversion error:', error);
      triggerDownload(audioBlob, 'audio.mp3');
    }
  };

  const downloadWAV = async () => {
    if (!audioBlob) return;
    setShowDownloadMenu(false);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const wavBlob = encodeWAV(audioBuffer);
      triggerDownload(wavBlob, 'audio.wav');
    } catch (error) {
      console.error('WAV conversion error:', error);
      alert('Error converting to WAV format');
    }
  };

  const encodeWAV = (audioBuffer: AudioBuffer): Blob => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const data: number[] = [];
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample));
        data.push(intSample < 0 ? intSample * 0x8000 : intSample * 0x7FFF);
      }
    }

    const dataLength = data.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      view.setInt16(offset, data[i], true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen p-6 ${
      theme === 'light'
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50'
        : 'bg-gradient-to-br from-teal-900 via-blue-900 to-gray-900'
    }`} onClick={() => setShowDownloadMenu(false)}>
      <div className="max-w-5xl mx-auto" onClick={(e) => e.stopPropagation()}>
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Voice Generator
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'music'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Music className="w-5 h-5" />
            AI Music (Suno)
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'music' ? (
          <SunoMusicGenerator />
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Volume2 className={`w-10 h-10 ${theme === 'light' ? 'text-teal-600' : 'text-teal-300'}`} />
                <h1 className={`text-4xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>AI Voice Generator</h1>
              </div>
              <p className={theme === 'light' ? 'text-gray-700' : 'text-teal-200'}>Transform text into lifelike speech or upload your audio files</p>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`backdrop-blur-lg rounded-2xl p-6 ${
              theme === 'light'
                ? 'bg-white/70 border border-gray-200 shadow-lg'
                : 'bg-white/10 border border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <label className={`flex items-center gap-2 font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  <FileAudio className="w-5 h-5" />
                  Upload Audio File
                </label>
                {uploadedFile && (
                  <button onClick={removeUploadedFile} className="text-red-400 hover:text-red-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!uploadedFile ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-teal-400/50 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-white/5 transition-all">
                  <Upload className="w-12 h-12 text-teal-300 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">Click to upload audio file</p>
                  <p className="text-teal-200 text-sm">MP3, WAV, OGG, WEBM supported</p>
                  <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="bg-teal-500/20 border border-teal-400/30 rounded-xl p-4 flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-teal-300" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{uploadedFile.name}</p>
                    <p className="text-teal-200 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className={`backdrop-blur-lg rounded-2xl p-6 ${
              theme === 'light'
                ? 'bg-white/70 border border-gray-200 shadow-lg'
                : 'bg-white/10 border border-white/20'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-5 h-5 text-white" />
                <label className="text-white font-semibold">Enter Text to Generate Speech</label>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here to convert to speech..." className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" maxLength={5000} />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-teal-200">{text.length} / 5000 characters</span>
                <button onClick={generateSpeech} disabled={isGenerating || !text.trim()} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Speech</>
                  )}
                </button>
              </div>
            </div>

            {audioUrl && (
              <div className={`backdrop-blur-lg rounded-2xl p-6 ${
              theme === 'light'
                ? 'bg-white/70 border border-gray-200 shadow-lg'
                : 'bg-white/10 border border-white/20'
            }`}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  {uploadedFile ? 'Playing: ' + uploadedFile.name : 'Generated Audio'}
                </h3>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} className="hidden" />
                <div className="space-y-4">
                  <div onClick={handleSeek} className="h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
                  </div>

                  <div className="flex justify-between text-sm text-teal-200">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={togglePlayPause} className="w-14 h-14 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors shadow-lg">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>

                    <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); }} className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg">
                        <Download className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">Download Audio</span>
                      </button>

                      {showDownloadMenu && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-300 z-50">
                          <div className="p-2">
                            <button onClick={(e) => { e.stopPropagation(); downloadOriginal(); }} className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 group">
                              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200">
                                <FileAudio className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">Original Format</div>
                                <div className="text-xs text-gray-500">Download as-is</div>
                              </div>
                            </button>

                            <button onClick={(e) => { e.stopPropagation(); downloadMP3(); }} className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 group">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                                <FileAudio className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">MP3 Format</div>
                                <div className="text-xs text-gray-500">Playable everywhere (WAV as MP3)</div>
                              </div>
                            </button>

                            <button onClick={(e) => { e.stopPropagation(); downloadWAV(); }} className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 group">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                                <FileAudio className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">WAV Format</div>
                                <div className="text-xs text-gray-500">Highest quality</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={`backdrop-blur-lg rounded-2xl p-6 ${
              theme === 'light'
                ? 'bg-white/70 border border-gray-200 shadow-lg'
                : 'bg-white/10 border border-white/20'
            }`}>
              <h3 className="text-white font-semibold mb-4">Select Voice</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {voices.length > 0 ? (
                  voices.slice(0, 10).map((voice, index) => (
                    <button key={index} onClick={() => setSelectedVoice(voice)} className={`w-full text-left p-3 rounded-xl transition-all ${ selectedVoice?.name === voice.name ? 'bg-teal-500 text-white' : 'bg-white/5 text-teal-100 hover:bg-white/10' }`}>
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs opacity-75">{voice.lang}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-teal-200 text-sm text-center py-4">Loading voices...</div>
                )}
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-2xl p-6 ${
              theme === 'light'
                ? 'bg-white/70 border border-gray-200 shadow-lg'
                : 'bg-white/10 border border-white/20'
            }`}>
              <h3 className="text-white font-semibold mb-4">Voice Settings</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-teal-200 text-sm">Pitch</label>
                    <span className="text-white text-sm">{stability.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={stability} onChange={(e) => setStability(parseFloat(e.target.value))} className="w-full accent-teal-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-teal-200 text-sm">Speed</label>
                    <span className="text-white text-sm">{clarity.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.01" value={clarity} onChange={(e) => setClarity(parseFloat(e.target.value))} className="w-full accent-teal-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-blue-100 text-sm text-center">
            <strong>✨ Features:</strong> Download your audio in Original, MP3, or WAV format • Generate speech from text • Upload and play audio files • Full playback controls
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
