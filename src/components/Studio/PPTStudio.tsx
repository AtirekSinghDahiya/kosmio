import React, { useState } from 'react';
import { ArrowLeft, Presentation, Sparkles, Download, Loader2, Layout, Palette, FileText, Zap } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getOpenRouterResponse } from '../../lib/openRouterService';

interface PPTStudioProps {
  projectId?: string;
}

interface Slide {
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image' | 'quote';
}

const PPT_TEMPLATES = [
  {
    id: 'creative-illustration',
    name: 'Creative Illustration',
    description: 'Colorful with hand-drawn elements',
    primary: 'from-orange-400 via-yellow-300 to-white',
    secondary: 'from-pink-300 via-purple-300 to-white',
    accent: 'from-blue-300 via-cyan-300 to-white',
    textColor: 'text-gray-900',
    accentColor: 'bg-blue-100/60',
    decorStyle: 'playful',
    preview: 'bg-gradient-to-br from-orange-400 via-yellow-300 to-white border-2 border-orange-200',
  },
  {
    id: 'social-psychology',
    name: 'Social Psychology',
    description: 'Clean with line art illustrations',
    primary: 'from-white to-blue-50',
    secondary: 'from-white to-purple-50',
    accent: 'from-white to-pink-50',
    textColor: 'text-blue-900',
    accentColor: 'bg-blue-100/50',
    decorStyle: 'lineart',
    preview: 'bg-gradient-to-br from-white to-blue-100 border-2 border-blue-300',
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Modern with gradient accents',
    primary: 'from-slate-900 via-blue-900 to-slate-900',
    secondary: 'from-indigo-900 via-purple-900 to-slate-900',
    accent: 'from-cyan-900 via-blue-800 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'bg-blue-500/20',
    decorStyle: 'geometric',
    preview: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
  },
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earth tones with organic shapes',
    primary: 'from-emerald-50 via-teal-100 to-green-50',
    secondary: 'from-lime-50 via-green-100 to-emerald-50',
    accent: 'from-teal-50 via-cyan-100 to-blue-50',
    textColor: 'text-green-900',
    accentColor: 'bg-emerald-100/60',
    decorStyle: 'organic',
    preview: 'bg-gradient-to-br from-emerald-100 via-teal-100 to-green-50 border-2 border-emerald-300',
  },
  {
    id: 'corporate-elegant',
    name: 'Corporate Elegant',
    description: 'Professional business theme',
    primary: 'from-blue-700 via-indigo-800 to-blue-900',
    secondary: 'from-indigo-600 via-blue-700 to-indigo-800',
    accent: 'from-sky-600 via-blue-700 to-indigo-800',
    textColor: 'text-white',
    accentColor: 'bg-blue-400/20',
    decorStyle: 'minimal',
    preview: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900',
  },
  {
    id: 'vibrant-creative',
    name: 'Vibrant Creative',
    description: 'Bold colors with dynamic shapes',
    primary: 'from-fuchsia-500 via-pink-500 to-rose-500',
    secondary: 'from-violet-500 via-purple-500 to-fuchsia-500',
    accent: 'from-orange-500 via-red-500 to-pink-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20',
    decorStyle: 'dynamic',
    preview: 'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500',
  },
  {
    id: 'minimalist-japan',
    name: 'Minimalist Japan',
    description: 'Clean Japanese-inspired design',
    primary: 'from-gray-50 to-red-50',
    secondary: 'from-white to-gray-100',
    accent: 'from-red-50 to-orange-50',
    textColor: 'text-gray-900',
    accentColor: 'bg-red-100/40',
    decorStyle: 'zen',
    preview: 'bg-gradient-to-br from-white via-red-50 to-gray-50 border-2 border-gray-200',
  },
  {
    id: 'educational-playful',
    name: 'Educational Playful',
    description: 'Bright and engaging for learning',
    primary: 'from-yellow-300 via-orange-300 to-yellow-200',
    secondary: 'from-green-300 via-teal-300 to-blue-300',
    accent: 'from-pink-300 via-purple-300 to-indigo-300',
    textColor: 'text-gray-900',
    accentColor: 'bg-yellow-200/60',
    decorStyle: 'fun',
    preview: 'bg-gradient-to-br from-yellow-300 via-orange-300 to-yellow-200 border-2 border-yellow-400',
  },
];

export const PPTStudio: React.FC<PPTStudioProps> = ({ projectId }) => {
  const { navigateTo } = useNavigation();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState(PPT_TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const generatePresentation = async () => {
    if (!topic.trim()) {
      showToast('error', 'Topic Required', 'Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    setSlides([]);

    try {
      const prompt = `Create a professional presentation outline with exactly ${slideCount} slides about: "${topic}".

For each slide, provide:
1. A clear, concise title (max 8 words)
2. 3-5 bullet points with key information
3. Layout type: "title", "content", "two-column", "image", or "quote"

Format your response as JSON array:
[
  {
    "title": "Slide Title",
    "content": ["Point 1", "Point 2", "Point 3"],
    "layout": "content"
  }
]

Make the first slide a title slide with the main topic and subtitle.
Make the last slide a conclusion or thank you slide.
Keep content concise and impactful.`;

      const response = await getOpenRouterResponse(
        prompt,
        [],
        'You are a professional presentation designer. Create well-structured, engaging presentation content. Always respond with valid JSON only.',
        'kimi'
      );

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const generatedSlides = JSON.parse(jsonMatch[0]) as Slide[];

      if (generatedSlides.length === 0) {
        throw new Error('No slides generated');
      }

      setSlides(generatedSlides);
      setCurrentSlideIndex(0);
      showToast('success', 'Presentation Generated', `Created ${generatedSlides.length} slides successfully!`);
    } catch (error: any) {
      console.error('PPT Generation Error:', error);
      showToast('error', 'Generation Failed', error.message || 'Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPresentation = () => {
    const pptContent = slides.map((slide, index) =>
      `Slide ${index + 1}: ${slide.title}\n${slide.content.join('\n')}\n\n`
    ).join('');

    const blob = new Blob([pptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}_presentation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'Downloaded', 'Presentation outline downloaded');
  };

  const renderDecorations = (decorStyle: string, isLight: boolean) => {
    switch (decorStyle) {
      case 'playful':
        return (
          <>
            <div className="absolute top-10 right-10 w-32 h-32 opacity-20">
              <svg viewBox="0 0 100 100" className={isLight ? 'text-orange-500' : 'text-white'} fill="currentColor">
                <circle cx="20" cy="20" r="15" />
                <circle cx="50" cy="50" r="20" opacity="0.7" />
                <circle cx="80" cy="30" r="12" opacity="0.5" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-10 w-40 h-40 opacity-15">
              <svg viewBox="0 0 100 100" className={isLight ? 'text-pink-500' : 'text-white'} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M 10 50 Q 30 20, 50 50 T 90 50" />
                <path d="M 20 60 Q 40 30, 60 60 T 90 60" />
              </svg>
            </div>
          </>
        );
      case 'lineart':
        return (
          <>
            <div className="absolute top-16 right-16 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" className="text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="100" cy="80" r="30" />
                <line x1="100" y1="110" x2="100" y2="140" />
                <line x1="100" y1="140" x2="80" y2="170" />
                <line x1="100" y1="140" x2="120" y2="170" />
                <line x1="100" y1="110" x2="75" y2="125" />
                <line x1="100" y1="110" x2="125" y2="125" />
              </svg>
            </div>
          </>
        );
      case 'geometric':
        return (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" className="text-cyan-400" fill="currentColor">
                <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
              <svg viewBox="0 0 200 200" className="text-blue-400" fill="currentColor">
                <rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)" />
              </svg>
            </div>
          </>
        );
      case 'organic':
        return (
          <>
            <div className="absolute top-10 right-10 w-56 h-56 opacity-15">
              <svg viewBox="0 0 200 200" className="text-green-600" fill="currentColor">
                <path d="M100,20 Q150,40 160,80 Q170,120 140,150 Q110,180 70,170 Q30,160 20,120 Q10,80 40,50 Q70,20 100,20" />
              </svg>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderSlide = (slide: Slide, index: number) => {
    const gradients = [selectedTemplate.primary, selectedTemplate.secondary, selectedTemplate.accent];
    const bgGradient = gradients[index % gradients.length];
    const isLight = selectedTemplate.textColor === 'text-gray-900' || selectedTemplate.textColor === 'text-blue-900' || selectedTemplate.textColor === 'text-green-900';

    return (
      <div
        key={index}
        className={`relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br ${bgGradient}`}
      >
        {renderDecorations(selectedTemplate.decorStyle, isLight)}

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, ${isLight ? '#000' : '#fff'} 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* Content */}
        <div className="relative h-full p-16 flex flex-col">
          {slide.layout === 'title' ? (
            <>
              {/* Title Slide */}
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className={`inline-block px-6 py-2 rounded-full ${selectedTemplate.accentColor} backdrop-blur-sm mb-8 border ${
                  isLight ? 'border-gray-300' : 'border-white/20'
                }`}>
                  <span className={`text-sm font-semibold ${selectedTemplate.textColor} opacity-90 uppercase tracking-wider`}>
                    Presentation
                  </span>
                </div>
                <h1 className={`text-6xl md:text-7xl font-bold ${selectedTemplate.textColor} mb-6 leading-tight`}>
                  {slide.title}
                </h1>
                {slide.content[0] && (
                  <p className={`text-2xl ${selectedTemplate.textColor} opacity-80 max-w-3xl font-light`}>
                    {slide.content[0]}
                  </p>
                )}
              </div>
              <div className={`absolute bottom-16 left-16 right-16 h-1 ${isLight ? 'bg-gray-300' : 'bg-white/20'} rounded-full`}>
                <div className={`h-full w-32 ${isLight ? 'bg-blue-600' : 'bg-white/60'} rounded-full`}></div>
              </div>
            </>
          ) : slide.layout === 'quote' ? (
            <>
              {/* Quote Slide */}
              <div className="flex-1 flex flex-col justify-center items-center text-center px-12">
                <div className={`text-8xl ${selectedTemplate.textColor} opacity-20 mb-6 font-serif`}>"</div>
                <blockquote className={`text-4xl italic font-light ${selectedTemplate.textColor} leading-relaxed mb-8`}>
                  {slide.content[0]}
                </blockquote>
                {slide.content[1] && (
                  <div className="flex items-center gap-4">
                    <div className={`h-px w-12 ${isLight ? 'bg-gray-400' : 'bg-white/50'}`}></div>
                    <p className={`text-xl ${selectedTemplate.textColor} opacity-70`}>
                      {slide.content[1]}
                    </p>
                    <div className={`h-px w-12 ${isLight ? 'bg-gray-400' : 'bg-white/50'}`}></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Content Slide */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-2 h-16 rounded-full ${isLight ? 'bg-blue-600' : 'bg-white/80'}`}></div>
                  <h2 className={`text-5xl font-bold ${selectedTemplate.textColor} leading-tight flex-1`}>
                    {slide.title}
                  </h2>
                </div>
                <div className={`h-px ${isLight ? 'bg-gray-300' : 'bg-white/20'} ml-6`}></div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6 ml-6">
                {slide.content.map((point, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-5 p-5 rounded-2xl ${selectedTemplate.accentColor} backdrop-blur-sm transition-all hover:scale-105 border ${
                      isLight ? 'border-gray-200' : 'border-white/10'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                      isLight ? 'bg-blue-600' : 'bg-white/30'
                    } flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${isLight ? 'text-white' : selectedTemplate.textColor}`}>
                        {i + 1}
                      </span>
                    </div>
                    <span className={`text-2xl ${selectedTemplate.textColor} opacity-95 leading-relaxed flex-1 pt-0.5`}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Slide number */}
          <div className="absolute bottom-8 right-8">
            <div className={`px-6 py-2 rounded-full ${selectedTemplate.accentColor} backdrop-blur-sm border ${
              isLight ? 'border-gray-300' : 'border-white/20'
            }`}>
              <span className={`text-sm font-semibold ${selectedTemplate.textColor} opacity-70`}>
                {index + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'light'
        ? 'bg-white'
        : 'bg-black'
    }`}>
      {/* Kimi-inspired Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${
        theme === 'light' ? 'border-gray-200 bg-white' : 'border-white/10 bg-black'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('chat')}
            className={`p-2 rounded-lg transition-all ${
              theme === 'light'
                ? 'hover:bg-gray-100'
                : 'hover:bg-white/10'
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
          </button>
          <div className="flex items-center gap-3">
            <img src="/kroniq-full-logo.svg" alt="KroniQ" className="h-8" />
          </div>
        </div>
        {slides.length > 0 && (
          <button
            onClick={downloadPresentation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'light'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {slides.length === 0 ? (
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Centered Logo & Title */}
            <div className="text-center mb-12">
              <h1 className={`text-5xl font-bold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Kimi Slides
              </h1>
              <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                AI-powered presentation creation
              </p>
            </div>

            {/* Input Section */}
            <div className={`p-8 rounded-2xl mb-8 ${
              theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
            }`}>
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    <FileText className="w-4 h-4 inline mr-2" />
                    Presentation Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., Introduction to Artificial Intelligence"
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'light'
                        ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        : 'bg-white/5 border-white/10 text-white focus:border-blue-400'
                    } focus:outline-none focus:ring-2 focus:ring-blue-400/20`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    <Layout className="w-4 h-4 inline mr-2" />
                    Number of Slides: {slideCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full h-2 bg-blue-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-white/50'}>5 slides</span>
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-white/50'}>30 slides</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-8">
              <label className={`block text-sm font-medium mb-4 ${
                theme === 'light' ? 'text-gray-700' : 'text-white/80'
              }`}>
                <Palette className="w-4 h-4 inline mr-2" />
                Choose Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PPT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`relative group cursor-pointer transition-all rounded-xl overflow-hidden ${
                      selectedTemplate.id === template.id
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105'
                    }`}
                  >
                    <div className={`aspect-video rounded-lg ${template.preview} shadow-lg`} />
                    <div className={`mt-2 text-sm font-medium ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {template.name}
                    </div>
                    <div className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-white/50'
                    }`}>
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePresentation}
              disabled={isGenerating || !topic.trim()}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all shadow-lg ${
                isGenerating || !topic.trim()
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : theme === 'light'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with Kimi AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Slides
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            <div className="relative">
              {renderSlide(slides[currentSlideIndex], currentSlideIndex)}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  currentSlideIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'light'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Previous
              </button>

              <div className={`text-sm font-medium ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                Slide {currentSlideIndex + 1} of {slides.length}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  currentSlideIndex === slides.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'light'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Next
              </button>
            </div>

            <button
              onClick={() => {
                setSlides([]);
                setCurrentSlideIndex(0);
                setTopic('');
              }}
              className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                theme === 'light'
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              Create New Presentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
