import React, { useState } from 'react';
import { X, FileText, Loader, Sparkles, Layout, Palette, Type, Clock, Image as ImageIcon, AlignLeft } from 'lucide-react';
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
  { id: 'dark', name: 'Dark Modern', desc: 'Sleek dark theme with neon accents', color: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-blue-500/30' },
  { id: 'gradient', name: 'Gradient Flow', desc: 'Smooth gradient transitions', color: 'bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500' },
];

const DESIGN_STYLES = [
  { id: 'modern', name: 'Modern', icon: '🎨' },
  { id: 'classic', name: 'Classic', icon: '📚' },
  { id: 'creative', name: 'Creative', icon: '✨' },
  { id: 'minimal', name: 'Minimal', icon: '⚪' },
  { id: 'bold', name: 'Bold', icon: '💥' },
];

const FONT_STYLES = [
  { id: 'sans', name: 'Sans Serif', desc: 'Modern & clean' },
  { id: 'serif', name: 'Serif', desc: 'Classic & elegant' },
  { id: 'mono', name: 'Monospace', desc: 'Tech & code' },
  { id: 'display', name: 'Display', desc: 'Bold & attention-grabbing' },
];

const COLOR_SCHEMES = [
  { id: 'blue', name: 'Blue', colors: ['#3b82f6', '#1e40af', '#93c5fd'] },
  { id: 'purple', name: 'Purple', colors: ['#8b5cf6', '#6d28d9', '#c4b5fd'] },
  { id: 'green', name: 'Green', colors: ['#10b981', '#047857', '#6ee7b7'] },
  { id: 'orange', name: 'Orange', colors: ['#f97316', '#c2410c', '#fdba74'] },
  { id: 'red', name: 'Red', colors: ['#ef4444', '#b91c1c', '#fca5a5'] },
  { id: 'teal', name: 'Teal', colors: ['#14b8a6', '#0f766e', '#5eead4'] },
];

const CONTENT_DENSITIES = [
  { id: 'concise', name: 'Concise', desc: '2-3 points per slide' },
  { id: 'balanced', name: 'Balanced', desc: '4-5 points per slide' },
  { id: 'detailed', name: 'Detailed', desc: '6-8 points per slide' },
];

export const PPTStudio: React.FC<PPTStudioProps> = ({ projectId, onClose, initialTopic = '', onSlidesGenerated }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [topic, setTopic] = useState(initialTopic);
  const [numSlides, setNumSlides] = useState(10);
  const [duration, setDuration] = useState(15);
  const [selectedTemplate, setSelectedTemplate] = useState('creative');
  const [designStyle, setDesignStyle] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');
  const [colorScheme, setColorScheme] = useState('blue');
  const [contentDensity, setContentDensity] = useState('balanced');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeTransitions, setIncludeTransitions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('warning', 'Topic Required', 'Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);

    try {
      const pointsPerSlide = contentDensity === 'concise' ? '2-3' : contentDensity === 'balanced' ? '4-5' : '6-8';

      const prompt = `Create a professional presentation outline for "${topic}" with exactly ${numSlides} slides for a ${duration} minute presentation.

Design Requirements:
- Style: ${designStyle}
- Template: ${TEMPLATES.find(t => t.id === selectedTemplate)?.name}
- Font Style: ${FONT_STYLES.find(f => f.id === fontStyle)?.name}
- Color Scheme: ${COLOR_SCHEMES.find(c => c.id === colorScheme)?.name}
- Content Density: ${contentDensity} (${pointsPerSlide} bullet points per slide)
- Include Image Suggestions: ${includeImages ? 'Yes' : 'No'}

Format each slide with:
1. A clear, engaging title
2. ${pointsPerSlide} concise bullet points
3. Layout type (title, content, two-column, image, or quote)
${includeImages ? '4. Image suggestion or description (optional)' : ''}

Return as JSON array: [{"title": "slide title", "content": ["point 1", "point 2", ...], "layout": "content", "imageSuggestion": "description of image"}]

Make the content engaging, informative, and appropriate for the ${duration} minute duration.`;

      const response = await getOpenRouterResponse(
        'openai/gpt-4-turbo',
        [{ role: 'user', content: prompt }],
        user?.uid
      );

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedSlides = JSON.parse(jsonMatch[0]);
        setSlides(parsedSlides);
        showToast('success', 'Presentation Created!', `Generated ${parsedSlides.length} slides for ${duration} min presentation`);

        if (user && projectId) {
          await savePPTToProject(user.uid, topic, parsedSlides, selectedTemplate);
        }

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
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">KroniQ Slides Studio</h2>
              <p className="text-xs text-white/50">Professional AI-powered presentations</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full max-w-6xl mx-auto space-y-8 py-6">
          {/* Presentation Topic */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <FileText className="w-4 h-4" />
              Presentation Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., Introduction to Artificial Intelligence"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              disabled={isGenerating}
            />
          </div>

          {/* Duration and Slides - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Clock className="w-4 h-4" />
                  Presentation Duration: {duration} min
                </label>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                disabled={isGenerating}
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((duration - 5) / 55) * 100}%, rgba(255,255,255,0.1) ${((duration - 5) / 55) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Number of Slides */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Layout className="w-4 h-4" />
                  Number of Slides: {numSlides}
                </label>
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
              <div className="flex justify-between text-xs text-white/40">
                <span>5 slides</span>
                <span>30 slides</span>
              </div>
            </div>
          </div>

          {/* Design Style Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Sparkles className="w-4 h-4" />
              Design Style
            </label>
            <div className="grid grid-cols-5 gap-3">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setDesignStyle(style.id)}
                  disabled={isGenerating}
                  className={`p-3 rounded-lg border transition-all ${
                    designStyle === style.id
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.icon}</div>
                  <div className="text-xs font-medium">{style.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Choose Template */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Palette className="w-4 h-4" />
              Color Template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  disabled={isGenerating}
                  className={`relative rounded-lg overflow-hidden transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`aspect-video ${template.color}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs font-semibold text-white">{template.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font and Color Scheme - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Font Style */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Type className="w-4 h-4" />
                Font Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_STYLES.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontStyle(font.id)}
                    disabled={isGenerating}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fontStyle === font.id
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">{font.name}</div>
                    <div className="text-xs text-white/50">{font.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Palette className="w-4 h-4" />
                Accent Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    disabled={isGenerating}
                    className={`p-3 rounded-lg border transition-all ${
                      colorScheme === scheme.id
                        ? 'bg-white/10 border-white/30 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {scheme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-6 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-medium text-white text-center">{scheme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Density */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <AlignLeft className="w-4 h-4" />
              Content Density
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONTENT_DENSITIES.map((density) => (
                <button
                  key={density.id}
                  onClick={() => setContentDensity(density.id)}
                  disabled={isGenerating}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    contentDensity === density.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-semibold text-white mb-1">{density.name}</div>
                  <div className="text-xs text-white/50">{density.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Additional Options</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  disabled={isGenerating}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
                />
                <ImageIcon className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/70">Include image suggestions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTransitions}
                  onChange={(e) => setIncludeTransitions(e.target.checked)}
                  disabled={isGenerating}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
                />
                <Sparkles className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/70">Add transitions & animations</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-white/5 text-white font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating Your Presentation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Presentation</span>
              </>
            )}
          </button>

          {/* Slides Preview */}
          {slides.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Slides ({slides.length})
              </h3>
              <div className="grid gap-4">
                {slides.map((slide, index) => (
                  <div key={index} className="p-5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-white font-semibold text-base">
                        {index + 1}. {slide.title}
                      </div>
                      <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {slide.layout}
                      </div>
                    </div>
                    <ul className="text-sm text-white/70 space-y-2">
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
