import React, { useRef, useState } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';
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
        <div className="flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm text-white"
            >
              <Paperclip className="w-4 h-4" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex gap-2">
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
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white p-4 rounded-2xl transition-all disabled:opacity-50 hover:scale-105"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={handleEnhancePrompt}
            disabled={!value.trim() || disabled || isEnhancing}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white p-4 rounded-2xl transition-all disabled:opacity-50 hover:scale-105"
            title="Enhance prompt with AI"
          >
            <Sparkles className={`w-5 h-5 ${isEnhancing ? 'animate-pulse' : ''}`} />
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
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none disabled:opacity-50 backdrop-blur-sm text-base"
            rows={3}
            style={{ minHeight: '100px', maxHeight: '200px' }}
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
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white p-4 rounded-2xl transition-all disabled:cursor-not-allowed hover:scale-105"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
