import React, { useState, useEffect } from 'react';
import { Presentation, Loader, Download, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { generatePPTContent, generatePPTXFile, downloadPPTX, GeneratedPPT } from '../../../lib/pptGenerationService';
import { savePPTToProject } from '../../../lib/contentSaveService';
import { executeGeneration, getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { checkGenerationLimit } from '../../../lib/generationLimitsService';
import { StudioHeader } from '../../Studio/StudioHeader';

interface PPTStudioProps {
  onClose: () => void;
  initialTopic?: string;
}

const STUDIO_COLOR = '#FF6B35';

const THEMES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean business style',
    gradient: 'from-blue-600 to-blue-800'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and colorful',
    gradient: 'from-orange-500 via-red-500 to-pink-500'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    gradient: 'from-gray-700 to-gray-900'
  },
];

const SLIDE_COUNTS = [3, 5, 7, 10, 15];

export const PPTStudio: React.FC<PPTStudioProps> = ({
  onClose,
  initialTopic = ''
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [topic, setTopic] = useState(initialTopic);
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPPT, setGeneratedPPT] = useState<GeneratedPPT | null>(null);
  const [pptBlob, setPPTBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [limitInfo, setLimitInfo] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  useEffect(() => {
    loadLimitInfo();
  }, [user]);

  const loadLimitInfo = async () => {
    if (!user?.uid) return;
    const limit = await checkGenerationLimit(user.uid, 'ppt');
    setLimitInfo(getGenerationLimitMessage('ppt', limit.isPaid, limit.current, limit.limit));
    setTokenBalance(50000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('error', 'Empty Topic', 'Please enter a presentation topic');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate presentations');
      return;
    }

    setIsGenerating(true);
    setGeneratedPPT(null);
    setPPTBlob(null);

    const result = await executeGeneration({
      userId: user.uid,
      generationType: 'ppt',
      modelId: 'ppt-generator',
      provider: 'internal',
      onProgress: setProgress
    }, async () => {
      const pptData = await generatePPTContent({
        topic,
        slideCount,
        theme: theme as 'professional' | 'modern' | 'creative' | 'minimal'
      });

      setGeneratedPPT(pptData);

      const blob = await generatePPTXFile(pptData);
      setPPTBlob(blob);

      await savePPTToProject(user.uid, topic, pptData, {
        slideCount,
        theme
      });

      return pptData;
    });

    if (result.success) {
      showToast('success', 'Presentation Generated!', `Your ${slideCount}-slide presentation is ready`);
      await loadLimitInfo();
    } else if (result.limitReached) {
      showToast('error', 'Limit Reached', result.error || 'Generation limit exceeded');
    } else if (result.insufficientTokens) {
      showToast('error', 'Insufficient Tokens', result.error || 'Not enough tokens');
    } else {
      showToast('error', 'Generation Failed', result.error || 'Failed to generate presentation');
    }

    setIsGenerating(false);
    setProgress('');
  };

  const handleDownload = () => {
    if (pptBlob && generatedPPT) {
      const filename = `${topic.replace(/[^a-z0-9]/gi, '_')}_presentation`;
      downloadPPTX(pptBlob, filename);
      showToast('success', 'Downloaded!', 'Presentation file downloaded');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <StudioHeader
        icon={Presentation}
        title="Presentation Generator"
        subtitle="Create AI-powered presentations instantly"
        color={STUDIO_COLOR}
        limitInfo={limitInfo}
        tokenBalance={tokenBalance}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black min-h-[40vh] lg:min-h-0">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader className="w-16 h-16 animate-spin text-[#FF6B35]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#FF6B35] animate-pulse" />
                </div>
              </div>
              <p className="text-white/60 text-sm text-center px-4">
                {progress || 'Creating your presentation...'}
              </p>
            </div>
          ) : generatedPPT ? (
            <div className="w-full max-w-4xl space-y-6">
              {/* Download Card */}
              <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/5 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8B35] flex items-center justify-center shadow-lg">
                  <Presentation className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Presentation Ready!</h3>
                <p className="text-white/60 mb-1 text-lg">{generatedPPT.title}</p>
                <p className="text-white/40 mb-6">{slideCount} professional slides created</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] hover:bg-[#FF8B35] text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Presentation
                </button>
              </div>

              {/* Slide Preview */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#FF6B35] rounded-full" />
                  Slide Preview
                </h4>
                <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {generatedPPT.slides.map((slide, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center">
                          <span className="text-[#FF6B35] font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="text-white font-semibold truncate">{slide.title}</h5>
                            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                              {slide.layout}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {slide.content.map((point, i) => (
                              <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                <span className="text-[#FF6B35] flex-shrink-0">•</span>
                                <span className="flex-1">{point}</span>
                              </li>
                            ))}
                          </ul>
                          {slide.notes && (
                            <p className="mt-3 text-xs text-white/40 italic border-l-2 border-white/10 pl-3">
                              Notes: {slide.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md px-4">
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/5 border border-[#FF6B35]/20 flex items-center justify-center">
                <Presentation className="w-16 h-16 text-[#FF6B35]/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Presentation Preview</h3>
              <p className="text-base text-white/40">
                Enter your topic and settings, then click generate to create a professional presentation
              </p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-black max-h-[60vh] lg:max-h-none overflow-y-auto">
          <button
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium">Controls</span>
            {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`${showControls ? 'block' : 'hidden lg:block'}`}>
            {/* Slide Count */}
            <div className="p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Number of Slides</label>
              <div className="grid grid-cols-5 gap-2">
                {SLIDE_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSlideCount(count)}
                    disabled={isGenerating}
                    className={`py-3 px-2 rounded-lg border text-sm font-semibold transition-all ${
                      slideCount === count
                        ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="p-6 border-b border-white/10">
              <label className="text-sm font-medium text-white/80 mb-3 block">Presentation Theme</label>
              <div className="space-y-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    disabled={isGenerating}
                    className={`w-full p-4 rounded-xl border transition-all group ${
                      theme === t.id
                        ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${t.gradient} shadow-lg`} />
                      <div className="text-left flex-1">
                        <div className="font-medium text-white text-sm">{t.name}</div>
                        <div className="text-xs text-white/50">{t.description}</div>
                      </div>
                      {theme === t.id && (
                        <div className="w-5 h-5 rounded-full bg-[#FF6B35] flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Input - Always Visible */}
          <div className="p-6 border-t border-white/10 bg-black mt-auto">
            <label className="text-sm font-medium text-white/80 mb-3 block">Presentation Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'AI in Healthcare', 'Climate Change Solutions', 'Future of Work'..."
              className="w-full h-28 px-4 py-3 bg-white/5 border border-white/10 focus:border-[#FF6B35]/40 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-none transition-colors"
              disabled={isGenerating}
              maxLength={500}
            />

            <div className="flex items-center justify-between text-xs text-white/40 mt-2 mb-4">
              <span>{topic.length} / 500 characters</span>
              <span>{slideCount} slides • {theme} theme</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#FF6B35] hover:bg-[#FF8B35] disabled:bg-white/5 text-white font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating Presentation...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-5 h-5" />
                  <span>Generate Presentation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
