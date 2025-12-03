/**
 * KroniQ PPT Generation Studio
 * Professional interface for AI-powered presentations
 */

import React, { useState } from 'react';
import { Presentation, Sparkles, Download, Loader, FileText, Upload } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { generatePPTContent, generatePPTXFile, GeneratedPPT } from '../../lib/pptGenerationService';
import { savePPTToProject } from '../../lib/contentSaveService';
import { checkGenerationLimit, incrementGenerationCount } from '../../lib/generationLimitsService';

export const PPTStudio: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPPT, setGeneratedPPT] = useState<GeneratedPPT | null>(null);
  const [pptBlob, setPPTBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState('');

  // Recent presentations
  const recentPresentations = [
    { title: 'LEGO COMPETITIVE STRATEGY', subtitle: 'POSITIONING, ANALYSIS & 3-YEAR ROADMAP', image: '/api/placeholder/300/200', date: 'Today' },
    { title: 'BOEING 737: A COMPREHENSIVE ANATOMY', subtitle: 'An Ultra-Detailed Breakdown of Components, Systems, and Function', image: '/api/placeholder/300/200', date: 'Yesterday' },
    { title: 'Halloween: Fun Traditions and Celebrations', subtitle: 'From Old Times to Today\'s Fun', image: '/api/placeholder/300/200', date: '2 days ago' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Topic', 'Please enter a presentation topic');
      return;
    }

    if (!user?.uid) {
      showToast('error', 'Authentication Required', 'Please log in to generate presentations');
      return;
    }

    const limitCheck = await checkGenerationLimit(user.uid, 'ppt');
    if (!limitCheck.canGenerate) {
      showToast('error', 'Generation Limit Reached', limitCheck.message);
      return;
    }

    setIsGenerating(true);
    setGeneratedPPT(null);
    setPPTBlob(null);

    try {
      setProgress('Generating presentation content...');
      const pptData = await generatePPTContent({
        topic: prompt,
        slideCount: 10,
        theme: 'professional'
      });

      setGeneratedPPT(pptData);

      setProgress('Creating downloadable file...');
      const blob = await generatePPTXFile(pptData);
      setPPTBlob(blob);

      setProgress('Saving to your projects...');
      await savePPTToProject(user.uid, prompt, pptData, {
        slideCount: 10,
        theme: 'professional'
      });

      await incrementGenerationCount(user.uid, 'ppt');

      showToast('success', 'PPT Generated!', 'Your presentation is ready to download');
      setProgress('');
    } catch (error: any) {
      console.error('PPT generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate presentation');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pptBlob) {
      const url = URL.createObjectURL(pptBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.substring(0, 30)}-${Date.now()}.pptx`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-2">KRONIQ</h1>
          <p className="text-center text-white/50 text-sm">Turn your ideas into stunning slides in minutes</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Input Area */}
          <div className="mb-12">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                <Presentation className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                placeholder="Turn your ideas into stunning slides in minutes"
                className="w-full bg-white/5 border-2 border-white/10 focus:border-cyan-400/50 rounded-2xl pl-12 pr-24 py-5 text-base focus:outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button className="p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <FileText className="w-5 h-5 text-white/50" />
                </button>
                <button className="p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <Upload className="w-5 h-5 text-white/50" />
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl transition-all"
                >
                  {isGenerating ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isGenerating && progress && (
              <p className="text-sm text-cyan-400 mt-3 text-center">{progress}</p>
            )}

            {prompt && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300">
                  📊 Slides
                </span>
                <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Generated PPT Display */}
          {generatedPPT && (
            <div className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{generatedPPT.title}</h3>
                  <p className="text-sm text-white/60">{generatedPPT.subtitle}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedPPT.slides.slice(0, 6).map((slide, index) => (
                  <div key={index} className="bg-black/40 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50 transition-all cursor-pointer">
                    <p className="text-xs text-white/40 mb-2">Slide {index + 1}</p>
                    <p className="text-sm font-medium line-clamp-2">{slide.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Presentations */}
          {!generatedPPT && recentPresentations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Recent presentations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPresentations.map((pres, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all mb-3">
                      <div className="aspect-[3/2] bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-center p-6">
                          <Presentation className="w-12 h-12 text-white/40 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Preview</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-2">
                      <h3 className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {pres.title}
                      </h3>
                      <p className="text-xs text-white/50 line-clamp-2">
                        {pres.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedPPT && recentPresentations.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your First Presentation</h3>
              <p className="text-white/50">Enter a topic above to generate stunning slides instantly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
