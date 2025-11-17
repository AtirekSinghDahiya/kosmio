import React, { useState } from 'react';
import { X, Code, Sparkles, FileCode, Loader } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface SimpleCodeStudioProps {
  onClose?: () => void;
}

export const SimpleCodeStudio: React.FC<SimpleCodeStudioProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [showLanding, setShowLanding] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const exampleApps = [
    {
      icon: '🎨',
      title: 'Nano banana powered app',
      description: 'Add powerful photo editing to your app. Allow users to add objects, remove backgrounds, or change a photo\'s style just by typing.'
    },
    {
      icon: '🎙️',
      title: 'Create conversational voice apps',
      description: 'Use the Gemini Live API to give your app a voice and make your own conversational experiences.'
    },
    {
      icon: '🎬',
      title: 'Animate images with Veo',
      description: 'Bring images to life with Veo 3. Let users upload a product photo and turn it into a dynamic video ad, or animate a character\'s portrait.'
    },
    {
      icon: 'G',
      title: 'Use Google Search data',
      description: 'Connect your app to real-time Google Search results. Build an agent that can discuss current events, cite recent news, or fact-check information.'
    }
  ];

  const recentProjects = [
    'Jane Doe - Developer & F...',
    'Gemini Image Generator',
    'Randomizer Hub',
    'Veo Studio',
    'SolidCraft AI'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Empty Prompt', 'Please describe what you want to build');
      return;
    }

    setIsGenerating(true);
    setShowLanding(false);

    try {
      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sampleCode = `import React, { useState } from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  link: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "Full-stack e-commerce solution with React and Node.js",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "/projects/ecommerce.jpg",
    link: "https://example.com"
  }
];

export default function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="container mx-auto px-6 py-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          Jane Doe
        </h1>
        <p className="text-xl text-gray-300">
          Full-Stack Developer & Business Founder
        </p>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="mb-16">
          <p className="text-lg text-gray-200 max-w-3xl leading-relaxed">
            I build innovative web applications that solve real-world problems and scale
            businesses. With a passion for both elegant code and strategic vision, I bring
            a unique blend of technical expertise and entrepreneurial spirit to every project.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-white mb-8">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}`;

      setGeneratedCode(sampleCode);
      showToast('success', 'Code Generated!', 'Your application is ready');
    } catch (error: any) {
      showToast('error', 'Generation Failed', error.message || 'Failed to generate code');
      setShowLanding(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (showLanding) {
    return (
      <div className="h-full flex flex-col bg-[#1a1a1a] text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">KroniQ AI Studio</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-56 border-r border-white/10 bg-[#1a1a1a]">
            <div className="p-4">
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium mb-4 transition-colors">
                Build
              </button>
              <div className="space-y-1">
                <button className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/5 rounded text-sm transition-colors">
                  Start
                </button>
                <button className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/5 rounded text-sm transition-colors">
                  Gallery
                </button>
                <button className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/5 rounded text-sm transition-colors">
                  Your apps
                </button>
                <button className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/5 rounded text-sm transition-colors">
                  FAQ
                </button>
              </div>

              <div className="mt-8">
                <div className="px-4 py-2 text-xs font-semibold text-white/40">Recently viewed</div>
                <div className="space-y-1">
                  {recentProjects.map((project, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-2 text-white/60 hover:bg-white/5 rounded text-xs transition-colors truncate"
                    >
                      {project}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black">
            <div className="max-w-4xl w-full">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Build your ideas with Gemini
                </h1>
                <p className="text-white/60 text-lg">Create powerful applications with AI assistance</p>
              </div>

              {/* Input Section */}
              <div className="mb-16">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your idea"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-blue-500/40 rounded-xl text-white text-lg placeholder-white/30 focus:outline-none resize-none transition-colors"
                    rows={3}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 transition-colors">
                      Model: Gemini 2.5 Pro
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                      🎤
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                      ⚙️
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-white/30 text-white font-medium rounded-lg transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      I'm feeling lucky
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white font-medium rounded-lg transition-all"
                    >
                      Build →
                    </button>
                  </div>
                </div>
              </div>

              {/* Example Apps Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Supercharge your apps with AI</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {exampleApps.map((app, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(app.description)}
                      className="text-left p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="text-3xl mb-3">{app.icon}</div>
                      <h3 className="font-semibold text-white mb-2">{app.title}</h3>
                      <p className="text-sm text-white/60">{app.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Discover and remix app ideas</h2>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    Browse the app gallery →
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {['Paint A Place', 'Past Forward', 'GemBooth', 'Pixshop'].map((name, idx) => (
                    <div key={idx} className="aspect-video bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="h-full flex items-center justify-center text-white/40 text-sm text-center">
                        {name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Code Generation View
  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to start
          </button>
          <div className="text-lg font-semibold">Gemini Image Generator</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">⚙️</button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">📥</button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">🔗</button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">↗️</button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Code Assistant */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Code assistant</span>
            </div>
            <p className="text-sm text-white/60 mb-4">Add new features or easily modify this app with a prompt or the suggestions below</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm hover:bg-blue-500/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-300">AI Features</span>
                </div>
              </button>
              {[
                'Add aspect ratio options',
                'Add negative prompt input',
                'Improve error handling',
                'Add image download button',
                'Implement history'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <input
              type="text"
              placeholder="Make changes, add new features, ask for anything"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 py-3 border-b border-white/10 bg-[#1a1a1a]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              • Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Code
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
              ⛶ Full screen
            </button>
            <div className="flex-1"></div>
            <button className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
              📱 Device
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-[#0d1117] p-6">
            {activeTab === 'preview' ? (
              isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-white/60">Generating your application...</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen text-white p-8">
                          <div class="max-w-4xl mx-auto">
                            <h1 class="text-5xl font-bold mb-4">Jane Doe</h1>
                            <p class="text-xl text-gray-300 mb-8">Full-Stack Developer & Business Founder</p>
                            <p class="text-lg text-gray-200 mb-12">I build innovative web applications that solve real-world problems and scale businesses.</p>
                            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                              <h3 class="text-xl font-bold mb-2">Featured Project</h3>
                              <p class="text-gray-300">E-commerce Platform</p>
                            </div>
                          </div>
                        </body>
                      </html>
                    `}
                    className="w-full h-[600px] bg-white rounded-lg border border-white/10"
                    title="Preview"
                  />
                </div>
              )
            ) : (
              <div className="max-w-6xl mx-auto">
                <pre className="bg-[#0d1117] text-gray-300 p-6 rounded-lg overflow-x-auto text-sm font-mono border border-white/10">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
