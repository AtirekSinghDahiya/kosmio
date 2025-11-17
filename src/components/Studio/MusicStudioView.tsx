import React, { useState } from 'react';
import { Music, Plus, ChevronDown, Sparkles } from 'lucide-react';

interface MusicStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
}

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({ initialModel = 'gemini-2.5-pro-preview-tts', onBack }) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'builder'>('builder');
  const [mode, setMode] = useState<'single' | 'multi'>('multi');
  const [styleInstructions, setStyleInstructions] = useState('Read aloud in a warm, welcoming tone');
  const [speaker1Text, setSpeaker1Text] = useState("Hello! We're excited to show you our native speech capabilities");
  const [speaker2Text, setSpeaker2Text] = useState('Where you can direct a voice, create realistic dialog, and so much more. Edit these placeholders to get started.');
  const [generating, setGenerating] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">KroniQ Audio Studio</span>
          </div>
        </div>

        {/* Top Center - Playground Title */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-medium">Playground</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/5 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="px-4 py-1.5 text-sm hover:bg-white/5 rounded transition-colors">
            Run settings
          </button>
          <button className="px-4 py-1.5 text-sm hover:bg-white/5 rounded transition-colors">
            Get code
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-white/10 p-4 overflow-y-auto bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h3 className="text-sm font-medium">Playground</h3>
          </div>

          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded transition-colors">
              A Person Dancing
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded transition-colors">
              Person Flying On Broom
            </button>
          </div>

          <button className="mt-4 text-sm text-blue-400 hover:text-blue-300">
            View all history →
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Buttons */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('structure')}
              className={`flex items-center gap-2 text-sm font-medium ${
                activeTab === 'structure' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Raw structure
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-2 text-sm font-medium ${
                activeTab === 'builder' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Script builder
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            <div className="max-w-4xl mx-auto">
              {activeTab === 'structure' && (
                <div className="text-sm text-white/50">
                  <p className="mb-4">The below reflects how to structure your script in your API request.</p>
                </div>
              )}

              {/* Script Builder Content */}
              <div className="space-y-6">
                {/* Style Instructions */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Style instructions</h3>
                  <textarea
                    value={styleInstructions}
                    onChange={(e) => setStyleInstructions(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 resize-none"
                    rows={2}
                  />
                </div>

                {/* Speakers Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Speakers</h3>
                  </div>

                  {/* Speaker 1 */}
                  <div className="mb-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-medium text-amber-400">Speaker 1</span>
                    </div>
                    <textarea
                      value={speaker1Text}
                      onChange={(e) => setSpeaker1Text(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Speaker 2 */}
                  {mode === 'multi' && (
                    <div className="mb-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-purple-400">Speaker 2</span>
                      </div>
                      <textarea
                        value={speaker2Text}
                        onChange={(e) => setSpeaker2Text(e.target.value)}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20 resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Add Dialog Button */}
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Add dialog
                  </button>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="mt-8 flex gap-3">
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                  <Music className="w-4 h-4 inline mr-2" />
                  Podcast transcript
                </button>
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Audio voice assistant
                </button>
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  Movie scene script
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="border-t border-white/10 p-4 bg-[#1a1a1a] flex items-center justify-end gap-3">
            <button
              onClick={() => setGenerating(true)}
              disabled={generating}
              className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Run
                  <span className="text-sm opacity-70">Ctrl ⏎</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="w-80 border-l border-white/10 p-6 overflow-y-auto bg-[#1a1a1a]">
          <h3 className="text-base font-medium mb-2">Gemini 2.5 Pro Preview TTS</h3>
          <p className="text-xs text-white/50 mb-6">
            gemini-2.5-pro-preview-tts<br />
            Our 2.5-Pro text-to-speech audio model optimized for powerful, low-latency speech generation for more natural outputs and easier to steer prompts.
          </p>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('single')}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  mode === 'single'
                    ? 'bg-blue-600/20 border-blue-600 text-white'
                    : 'bg-[#2a2a2a] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Single-speaker<br />audio
              </button>
              <button
                onClick={() => setMode('multi')}
                className={`p-3 rounded-lg border text-sm transition-all ${
                  mode === 'multi'
                    ? 'bg-blue-600/20 border-blue-600 text-white'
                    : 'bg-[#2a2a2a] border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Multi-speaker<br />audio
              </button>
            </div>
          </div>

          {/* Model Settings */}
          <button className="flex items-center justify-between w-full py-3 border-t border-white/10 text-sm font-medium">
            <span>Model settings</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Voice Settings */}
          <button className="flex items-center justify-between w-full py-3 border-t border-white/10 text-sm font-medium">
            <span>Voice settings</span>
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>

          <div className="mt-4 space-y-4">
            {/* Speaker 1 Settings */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-400">Speaker 1 settings</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue="Speaker 1"
                    className="w-full px-3 py-1.5 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/50 mb-1">Voice</label>
                  <select className="w-full px-3 py-1.5 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20">
                    <option>🗣️ Zephyr</option>
                    <option>🗣️ Puck</option>
                    <option>🗣️ Charon</option>
                    <option>🗣️ Kore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Speaker 2 Settings */}
            {mode === 'multi' && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-400">Speaker 2 settings</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue="Speaker 2"
                      className="w-full px-3 py-1.5 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/50 mb-1">Voice</label>
                    <select className="w-full px-3 py-1.5 bg-[#2a2a2a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/20">
                      <option>🗣️ Puck</option>
                      <option>🗣️ Zephyr</option>
                      <option>🗣️ Charon</option>
                      <option>🗣️ Kore</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
