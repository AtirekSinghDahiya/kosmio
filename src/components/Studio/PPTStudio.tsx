import React, { useState } from 'react';
import { X, FileText, Loader, Sparkles } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { getOpenRouterResponse } from '../../lib/openRouterService';
import { savePPTToProject } from '../../lib/contentSaveService';

interface PPTStudioProps {
  projectId?: string;
  onClose?: () => void;
  initialTopic?: string;
  onSlidesGenerated?: (slides: Slide[], topic: string) => void;
}

interface Slide {
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image' | 'quote';
}

const TEMPLATES = [
  { id: 'creative', name: 'Creative Illustration', desc: 'Colorful with hand-drawn elements', color: 'bg-gradient-to-br from-orange-400 via-yellow-300 to-yellow-100' },
  { id: 'social', name: 'Social Psychology', desc: 'Clean with line art illustrations', color: 'bg-gradient-to-br from-white to-blue-100 border-2 border-blue-200' },
  { id: 'tech', name: 'Tech Futuristic', desc: 'Modern with gradient accents', color: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' },
  { id: 'nature', name: 'Nature Organic', desc: 'Earth tones with organic shapes', color: 'bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100' },
  { id: 'corporate', name: 'Corporate Elegant', desc: 'Professional business theme', color: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900' },
  { id: 'vibrant', name: 'Vibrant Creative', desc: 'Bold colors with dynamic shapes', color: 'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500' },
  { id: 'minimal', name: 'Minimalist Japan', desc: 'Clean Japanese-inspired design', color: 'bg-gradient-to-br from-gray-50 to-red-50 border-2 border-gray-200' },
  { id: 'education', name: 'Educational Playful', desc: 'Bright and engaging for learning', color: 'bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-200' },
];

export const PPTStudio: React.FC<PPTStudioProps> = ({ projectId, onClose, initialTopic = '', onSlidesGenerated }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [topic, setTopic] = useState(initialTopic);
  const [numSlides, setNumSlides] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState('creative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('warning', 'Topic Required', 'Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Create a presentation outline for "${topic}" with exactly ${numSlides} slides. Format each slide with a title and 3-5 bullet points. Return as JSON array: [{"title": "slide title", "content": ["point 1", "point 2", ...], "layout": "content"}]`;

      const response = await getOpenRouterResponse(
        'openai/gpt-4-turbo',
        [{ role: 'user', content: prompt }],
        user?.uid
      );

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedSlides = JSON.parse(jsonMatch[0]);
        setSlides(parsedSlides);
        showToast('success', 'Presentation Created!', `Generated ${parsedSlides.length} slides`);

        if (user && projectId) {
          await savePPTToProject(user.uid, topic, parsedSlides, selectedTemplate);
        }

        // Call callback if provided
        if (onSlidesGenerated) {
          onSlidesGenerated(parsedSlides, topic);
        }
      } else {
        throw new Error('Failed to parse slides from response');
      }
    } catch (error: any) {
      console.error('PPT generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Could not generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="bg-black border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">KroniQ Slides</h2>
              <p className="text-xs text-white/50">AI-powered presentation creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="w-full max-w-5xl mx-auto space-y-10 py-8">
          {/* Presentation Topic */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-white/70">
              <FileText className="w-4 h-4" />
              Presentation Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., Introduction to Artificial Intelligence"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all text-sm"
              disabled={isGenerating}
            />
          </div>

          {/* Number of Slides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Sparkles className="w-4 h-4" />
                Number of Slides: {numSlides}
              </label>
              <span className="text-xs text-white/40">5 slides — 30 slides</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={numSlides}
              onChange={(e) => setNumSlides(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
              disabled={isGenerating}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((numSlides - 5) / 25) * 100}%, rgba(255,255,255,0.1) ${((numSlides - 5) / 25) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          {/* Choose Template */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base font-medium text-white">
              <Sparkles className="w-5 h-5" />
              Choose Template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  disabled={isGenerating}
                  className={`relative rounded-xl overflow-hidden transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`aspect-video ${template.color}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="text-sm font-semibold text-white">{template.name}</div>
                    <div className="text-xs text-white/70 mt-0.5">{template.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-white/5 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Slides...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Slides</span>
              </>
            )}
          </button>

          {/* Slides Preview */}
          {slides.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white">Generated Slides</h3>
              <div className="grid gap-4">
                {slides.map((slide, index) => (
                  <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-white font-semibold mb-2">
                      {index + 1}. {slide.title}
                    </div>
                    <ul className="text-sm text-white/70 space-y-1">
                      {slide.content.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
