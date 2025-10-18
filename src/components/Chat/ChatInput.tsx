import React, { useRef } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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
}) => {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-3">
      <div className={`relative flex items-end gap-2 rounded-3xl p-2 shadow-sm ${
        theme === 'light'
          ? 'bg-gray-100 border border-gray-200'
          : 'bg-white/5 backdrop-blur-xl border border-white/10'
      }`}>
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
          className={`flex-1 bg-transparent px-4 py-3 resize-none focus:outline-none text-sm ${
            theme === 'light'
              ? 'text-gray-800 placeholder-gray-400'
              : 'text-white placeholder-white/40'
          }`}
          rows={1}
          style={{ minHeight: '24px', maxHeight: '200px' }}
        />

        <button
          onClick={() => {
            console.log('💬 Send button clicked!');
            console.log('💬 Value:', value);
            console.log('💬 Disabled:', disabled);
            onSend();
          }}
          disabled={!value.trim() || disabled}
          className={`flex-shrink-0 p-2 rounded-xl transition-all ${
            value.trim() && !disabled
              ? theme === 'light'
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white text-black hover:bg-gray-200'
              : theme === 'light'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      <p className={`text-xs text-center ${
        theme === 'light' ? 'text-gray-400' : 'text-white/30'
      }`}>
        KroniQ can make mistakes. Check important info.
      </p>
    </div>
  );
};
