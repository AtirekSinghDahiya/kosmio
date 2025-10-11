import React from 'react';
import { ArrowLeft, Code2, Sparkles } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

interface CodeStudioProps {
  projectId?: string;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({ projectId }) => {
  const { navigateTo } = useNavigation();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('chat')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Code Studio</h1>
              <p className="text-sm text-white/60">AI-Powered Code Generation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10">
            <Sparkles className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Code Studio Coming Soon</h2>
          <p className="text-lg text-white/60">
            Build full-stack applications, generate code snippets, and debug with AI assistance.
            This powerful studio is currently under development.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => navigateTo('chat')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition-all"
            >
              Return to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
