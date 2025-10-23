import React, { useState } from 'react';
import { ArrowLeft, Presentation, Sparkles, Download, Loader2, Layout, Palette, FileText } from 'lucide-react';
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
    id: 'modern-gradient',
    name: 'Modern Gradient',
    description: 'Sleek design with vibrant gradients',
    primary: 'from-blue-600 via-purple-600 to-pink-600',
    secondary: 'from-cyan-500 via-blue-600 to-purple-700',
    accent: 'from-purple-500 via-pink-500 to-red-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20',
    preview: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
  },
  {
    id: 'tech-dark',
    name: 'Tech Dark',
    description: 'Modern tech-inspired dark theme',
    primary: 'from-slate-900 via-blue-900 to-slate-900',
    secondary: 'from-gray-900 via-slate-800 to-gray-900',
    accent: 'from-cyan-900 via-blue-900 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'bg-cyan-500/20',
    preview: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    description: 'Clean and sophisticated',
    primary: 'from-gray-50 to-blue-50',
    secondary: 'from-white to-gray-100',
    accent: 'from-blue-50 to-indigo-100',
    textColor: 'text-gray-900',
    accentColor: 'bg-blue-600/10',
    preview: 'bg-gradient-to-br from-white to-blue-50 border-2 border-gray-200',
  },
  {
    id: 'corporate-pro',
    name: 'Corporate Pro',
    description: 'Professional business style',
    primary: 'from-blue-700 via-indigo-800 to-blue-900',
    secondary: 'from-indigo-700 via-blue-800 to-indigo-900',
    accent: 'from-sky-700 via-blue-800 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'bg-blue-400/20',
    preview: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900',
  },
  {
    id: 'sunset-vibrant',
    name: 'Sunset Vibrant',
    description: 'Bold and energetic',
    primary: 'from-orange-500 via-red-500 to-pink-600',
    secondary: 'from-yellow-500 via-orange-600 to-red-600',
    accent: 'from-red-500 via-pink-600 to-purple-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20',
    preview: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh and organic',
    primary: 'from-emerald-600 via-green-600 to-teal-700',
    secondary: 'from-green-500 via-emerald-600 to-teal-700',
    accent: 'from-teal-600 via-cyan-600 to-blue-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20',
    preview: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700',
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

    showToast('success', 'Downloaded', 'Presentation outline downloaded as text file');
  };

  const renderSlide = (slide: Slide, index: number) => {
    const gradients = [selectedTemplate.primary, selectedTemplate.secondary, selectedTemplate.accent];
    const bgGradient = gradients[index % gradients.length];
    const isLight = selectedTemplate.id === 'minimal-elegant';

    return (
      <div
        key={index}
        className={`relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br ${bgGradient}`}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
        </div>

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* Content */}
        <div className="relative h-full p-16 flex flex-col">
          {slide.layout === 'title' ? (
            <>
              {/* Title Slide */}
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className={`inline-block px-6 py-2 rounded-full ${selectedTemplate.accentColor} backdrop-blur-sm mb-8`}>
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
              {/* Decorative line */}
              <div className="absolute bottom-16 left-16 right-16 h-1 bg-white/20 rounded-full">
                <div className="h-full w-32 bg-white/60 rounded-full"></div>
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
              {/* Header with decorative line */}
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
                    className={`flex items-start gap-5 p-5 rounded-2xl ${selectedTemplate.accentColor} backdrop-blur-sm transition-all hover:scale-105`}
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

          {/* Slide number - bottom right */}
          <div className="absolute bottom-8 right-8">
            <div className={`px-6 py-2 rounded-full ${selectedTemplate.accentColor} backdrop-blur-sm`}>
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
        ? 'bg-gradient-to-br from-gray-50 to-blue-50'
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
    }`}>
      <div className={`flex items-center justify-between p-6 border-b ${
        theme === 'light' ? 'border-gray-200 bg-white/50' : 'border-white/10 bg-black/20'
      } backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('chat')}
            className={`p-2 rounded-xl transition-all border ${
              theme === 'light'
                ? 'bg-white hover:bg-gray-50 border-gray-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${theme === 'light' ? 'text-gray-700' : 'text-white'}`} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                PPT Studio
              </h1>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                AI-Powered Presentation Generator
              </p>
            </div>
          </div>
        </div>
        {slides.length > 0 && (
          <button
            onClick={downloadPresentation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Download Outline
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {slides.length === 0 ? (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className={`p-8 rounded-2xl ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-white/5 border border-white/10'
            } backdrop-blur-xl`}>
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
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                        : 'bg-white/5 border-white/10 text-white focus:border-cyan-400'
                    } focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
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
                    className="w-full h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-white/50'}>5 slides</span>
                    <span className={theme === 'light' ? 'text-gray-500' : 'text-white/50'}>30 slides</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'light' ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    <Palette className="w-4 h-4 inline mr-2" />
                    Design Template
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PPT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`relative group cursor-pointer transition-all rounded-xl overflow-hidden ${
                          selectedTemplate.id === template.id
                            ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-transparent scale-105'
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

                <button
                  onClick={generatePresentation}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating with Kimi AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Presentation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
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
                    ? 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-md hover:shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
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
                    ? 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-md hover:shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
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
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
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
