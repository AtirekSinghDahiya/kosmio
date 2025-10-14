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
    <div className="space-y-3">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="group relative flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-white transition-all duration-300"
            >
              <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 p-0.5 hover:bg-red-500/20 rounded-full text-white/60 hover:text-red-400 transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFF0]/20 via-[#8A2BE2]/20 to-[#00FFF0]/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-end gap-2">
          <div className="flex flex-col gap-2">
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
              className="relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-white p-3.5 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-105 group/attach"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5 group-hover/attach:rotate-12 transition-transform duration-300" />
              {attachedFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {attachedFiles.length}
                </span>
              )}
            </button>
            <button
              onClick={handleEnhancePrompt}
              disabled={!value.trim() || disabled || isEnhancing}
              className="relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 text-white p-3.5 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-105 group/enhance"
              title="Enhance prompt with AI"
            >
              <Sparkles className={`w-5 h-5 transition-all duration-300 ${isEnhancing ? 'animate-spin' : 'group-hover/enhance:rotate-12'}`} />
              {isEnhancing && (
                <span className="absolute inset-0 bg-purple-400/20 rounded-2xl animate-pulse" />
              )}
            </button>
          </div>

          <div className="flex-1 relative">
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
              className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/50 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none disabled:opacity-50 backdrop-blur-sm text-base transition-all duration-300"
              rows={3}
              style={{ minHeight: '90px', maxHeight: '200px' }}
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
            className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white p-4 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 group/send"
          >
            <Send className="w-5 h-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform duration-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover/send:opacity-100 rounded-2xl transition-opacity duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
