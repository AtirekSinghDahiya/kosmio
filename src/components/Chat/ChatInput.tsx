import React, { useRef, useState } from 'react';
import { ArrowUp, Paperclip, Mic, Image as ImageIcon, Brain, Zap, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { TokenEstimateDisplay } from './TokenEstimateDisplay';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedModel: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder = 'Type your message...',
  disabled = false,
  conversationHistory,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const chatOptions = [
    { id: 'deep-research', label: 'Deep Research', icon: Search, color: 'cyan' },
    { id: 'think-longer', label: 'Think Longer', icon: Brain, color: 'purple' },
    { id: 'creative-mode', label: 'Creative Mode', icon: Zap, color: 'orange' },
  ];

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      showToast('success', 'Files Attached', `${files.length} file(s) attached`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Chat Options */}
      <div className="flex flex-wrap gap-2">
        {chatOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOptions.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? option.color === 'cyan'
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/50'
                    : option.color === 'purple'
                    ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/50'
                    : 'bg-orange-500/20 text-orange-300 border-2 border-orange-500/50'
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                    : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                theme === 'light'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-white/10 text-white'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="w-full">
          <div className={`relative rounded-2xl shadow-lg border-2 ${
            theme === 'light'
              ? 'bg-white/95 backdrop-blur-xl border-gray-200'
              : 'bg-white/10 backdrop-blur-xl border-white/20'
          }`}>
            <div className="flex items-end gap-2 p-2">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1 pb-2">
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
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-white/10 text-gray-400'
              }`}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => showToast('info', 'Coming Soon', 'Image upload coming soon!')}
              disabled={disabled}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-white/10 text-gray-400'
              }`}
              title="Upload image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
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
            className={`flex-1 bg-transparent px-4 py-3 resize-none focus:outline-none text-sm font-medium ${
              theme === 'light'
                ? 'text-gray-800 placeholder-gray-400'
                : 'text-white/90 placeholder-white/40'
            }`}
            rows={1}
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 pb-2">
            <button
              onClick={() => showToast('info', 'Coming Soon', 'Voice input coming soon!')}
              disabled={disabled}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-white/10 text-gray-400'
              }`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                console.log('💬 Send button clicked!');
                console.log('💬 Value:', value);
                console.log('💬 Disabled:', disabled);
                onSend();
              }}
              disabled={!value.trim() || disabled}
              className={`p-2 rounded-xl transition-all ${
                value.trim() && !disabled
                  ? theme === 'light'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'
                  : theme === 'light'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Token Estimate Display */}
      <div className="flex items-center justify-between">
        <TokenEstimateDisplay
          message={value}
          conversationHistory={conversationHistory}
          className="ml-2"
        />
        <p className={`text-xs ${
          theme === 'light' ? 'text-gray-400' : 'text-white/30'
        }`}>
          KroniQ can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
