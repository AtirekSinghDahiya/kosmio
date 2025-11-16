import React, { useState } from 'react';
import { Code, FileCode, FolderOpen, Sparkles, Play, Loader } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { getOpenRouterResponse } from '../../lib/openRouterService';

interface CodeStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export const CodeStudioView: React.FC<CodeStudioViewProps> = ({ initialModel, onBack, onClose }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState('index.tsx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerateCode = async (userPrompt: string) => {
    if (!userPrompt.trim()) {
      showToast('warning', 'Prompt Required', 'Please describe what you want to build');
      return;
    }

    setIsGenerating(true);
    try {
      const systemPrompt = `You are an expert React developer. Generate clean, production-ready React code based on the user's request. Include TypeScript types, proper styling with Tailwind CSS, and follow best practices.`;

      const response = await getOpenRouterResponse(
        'anthropic/claude-3.5-sonnet',
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        user?.uid
      );

      setGeneratedCode(response);
      setActiveTab('code');
      showToast('success', 'Code Generated!', 'Your code has been generated successfully');
    } catch (error: any) {
      console.error('Code generation error:', error);
      showToast('error', 'Generation Failed', error.message || 'Could not generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const codeContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  return (
    <div className="h-screen flex bg-[#1a1a1a] text-white">
      {/* Left Panel - Chat */}
      <div className="w-96 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={onClose || onBack}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-4"
          >
            ← Back to start
          </button>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="font-medium">Code assistant</span>
          </div>
        </div>

        {/* Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Main Suggestion Card */}
          <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Add new features or easily modify</p>
                <p className="text-xs text-white/50">this app with a prompt or the suggestions below</p>
              </div>
            </div>
          </div>

          {/* Suggestion Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleGenerateCode('Add AI-powered features to this portfolio website')}
              disabled={isGenerating}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm">AI Features</span>
            </button>

            <button
              onClick={() => handleGenerateCode('Add a modern contact form with validation')}
              disabled={isGenerating}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">Add Contact Form</span>
            </button>

            <button
              onClick={() => handleGenerateCode('Add an eye-catching call-to-action button section')}
              disabled={isGenerating}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">Add Call to Action</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
              <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-sm">Animate Section Transitions</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
              <FileCode className="w-4 h-4 text-white/50 flex-shrink-0" />
              <span className="text-sm">Add Resume Download</span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors">
              <svg className="w-4 h-4 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Improve Footer Links</span>
            </button>
          </div>
        </div>

        {/* Bottom Input */}
        <div className="border-t border-white/10 p-4 bg-[#1a1a1a]">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Make changes, add new features, ask for anything"
              className="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={() => handleGenerateCode(prompt)}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview/Code */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium">Jane Doe - Developer & Founder Portfolio</h2>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 text-sm rounded transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                • Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-1.5 text-sm rounded transition-all ${
                  activeTab === 'code'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                • Code
              </button>
            </div>

            <button className="px-3 py-1.5 text-sm border border-white/10 rounded hover:bg-white/5 transition-colors">
              ⛶ Full screen
            </button>
            <button className="px-3 py-1.5 text-sm border border-white/10 rounded hover:bg-white/5 transition-colors">
              📱 Device
            </button>

            <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'preview' ? (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="min-h-full flex items-center justify-center p-12">
              <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-6xl font-bold text-white">Jane Doe</h1>
                  <p className="text-2xl text-blue-300">Full-Stack Developer & Business Founder</p>
                </div>

                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  I build innovative web applications that solve real-world problems and scale businesses.
                  With a passion for both elegant code and strategic vision, I bring a unique blend of
                  technical expertise and entrepreneurial spirit to every project.
                </p>

                <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                  View My Work
                </button>

                <div className="flex justify-center gap-8 text-sm pt-8">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Skills</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Projects</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Experience</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <div className="w-64 border-r border-white/10 bg-[#1a1a1a] overflow-y-auto">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">File explorer</span>
                <button className="p-1 hover:bg-white/10 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>App.tsx</span>
                </button>

                <div>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <span>components</span>
                  </button>
                  <div className="ml-6 space-y-1">
                    <button className="w-full flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-left text-xs text-white/70">
                      <FileCode className="w-3 h-3" />
                      <span>About.tsx</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-left text-xs text-white/70">
                      <FileCode className="w-3 h-3" />
                      <span>Contact.tsx</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-left text-xs text-white/70">
                      <FileCode className="w-3 h-3" />
                      <span>Experience.tsx</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded text-left text-xs text-white/70">
                      <FileCode className="w-3 h-3" />
                      <span>Header.tsx</span>
                    </button>
                  </div>
                </div>

                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                  <FileCode className="w-4 h-4 text-yellow-400" />
                  <span>constants.ts</span>
                </button>

                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                  <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                  </svg>
                  <span>index.html</span>
                </button>

                <button className="w-full flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded text-left text-sm">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>index.tsx</span>
                </button>

                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                  </svg>
                  <span>metadata.json</span>
                </button>

                <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded text-left text-sm">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>types.ts</span>
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between bg-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{selectedFile}</span>
                </div>
                <button className="text-white/50 hover:text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                      <p className="text-white/60 text-sm">Generating code...</p>
                    </div>
                  </div>
                ) : generatedCode ? (
                  <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    <code>{generatedCode}</code>
                  </pre>
                ) : (
                  <pre className="text-gray-300 leading-relaxed">
                    <code>{codeContent}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
