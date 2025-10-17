import React, { useRef, useState } from 'react';
import { Send, Paperclip, Sparkles, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { callAI } from '../../lib/aiProviders';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedModel: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder = 'Type your message...',
  disabled = false,
  selectedModel
}) => {
  const { showToast } = useToast();
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    showToast('success', 'Files Attached', `${files.length} file(s) attached`);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnhancePrompt = async () => {
    if (!value.trim()) {
      showToast('info', 'Enter Text', 'Please enter some text to enhance');
      return;
    }

    try {
      setIsEnhancing(true);
      const enhancementPrompt = [
        {
          role: 'system' as const,
          content: 'You are a prompt enhancement expert. Take the user\'s input and rewrite it to be more clear, detailed, and effective. Keep the core intent but make it more actionable and specific. Return ONLY the enhanced prompt, no explanations.'
        },
        {
          role: 'user' as const,
          content: value
        }
      ];

      const response = await callAI(enhancementPrompt, selectedModel);
      onChange(response.content);
      showToast('success', 'Enhanced', 'Your prompt has been enhanced');
    } catch (error: any) {
      showToast('error', 'Enhancement Failed', error.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-3 px-4 pb-4">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 hover:border-cyan-400/40 rounded-xl text-sm text-white transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-cyan-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
              <Paperclip className="w-4 h-4 text-cyan-400 relative z-10" />
              <span className="max-w-[200px] truncate relative z-10">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 hover:bg-red-500/30 rounded-full text-white/60 hover:text-red-400 transition-all duration-200 relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-teal-500/30 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 animate-pulse" />
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400/40 via-blue-500/40 to-teal-400/40 rounded-[26px] opacity-0 group-focus-within:opacity-100 transition-all duration-500" />

        <div className="relative flex items-end gap-2 md:gap-3 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-2 md:p-4 border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />

          <div className="flex flex-col gap-1.5 md:gap-2.5 relative z-10">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileAttach}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 active:from-white/15 active:to-white/10 border border-white/20 hover:border-cyan-400/60 active:border-cyan-400/60 text-white p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-40 md:hover:scale-110 active:scale-95 group/attach shadow-lg hover:shadow-cyan-400/30 touch-manipulation"
              title="Attach files"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/attach:translate-x-[100%] transition-transform duration-700" />
              <Paperclip className="w-5 h-5 relative z-10 group-hover/attach:rotate-12 group-hover/attach:scale-110 transition-transform duration-300" />
              {attachedFiles.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-cyan-400/50 ring-2 ring-slate-900">
                  {attachedFiles.length}
                </span>
              )}
            </button>
            <button
              onClick={handleEnhancePrompt}
              disabled={!value.trim() || disabled || isEnhancing}
              className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 active:from-white/15 active:to-white/10 border border-white/20 hover:border-teal-400/60 active:border-teal-400/60 text-white p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-40 md:hover:scale-110 active:scale-95 group/enhance shadow-lg hover:shadow-teal-400/30 touch-manipulation"
              title="Enhance prompt with AI"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/enhance:translate-x-[100%] transition-transform duration-700" />
              <Sparkles className={`w-5 h-5 relative z-10 transition-all duration-300 ${isEnhancing ? 'animate-spin text-teal-300' : 'group-hover/enhance:rotate-12 group-hover/enhance:scale-110'}`} />
              {isEnhancing && (
                <span className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-2xl animate-pulse" />
              )}
            </button>
          </div>

          <div className="flex-1 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyPress={onKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-gradient-to-br from-white/8 to-white/4 border border-white/20 focus:border-cyan-400/60 rounded-xl md:rounded-2xl px-3 md:px-5 py-3 md:py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 resize-none disabled:opacity-50 backdrop-blur-sm text-base transition-all duration-300 shadow-inner touch-manipulation"
              rows={3}
              style={{ minHeight: '70px', maxHeight: '150px' }}
            />
          </div>

          <button
            onClick={() => {
              console.log('💬 Send button clicked!');
              console.log('💬 Value:', value);
              console.log('💬 Disabled:', disabled);
              onSend();
            }}
            disabled={!value.trim() || disabled}
            className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:via-teal-400 hover:to-blue-500 active:from-cyan-400 active:via-teal-400 active:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-40 text-white p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 disabled:cursor-not-allowed md:hover:scale-110 active:scale-95 hover:shadow-2xl hover:shadow-cyan-400/50 group/send z-10 touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/send:translate-x-[100%] transition-transform duration-500" />
            <Send className="w-5 h-5 relative z-10 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform duration-200 drop-shadow-lg" />
          </button>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center gap-2 text-white/30 text-xs">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse" />
        <span>Press Enter to send • Shift + Enter for new line</span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse" />
      </div>
    </div>
  );
};
