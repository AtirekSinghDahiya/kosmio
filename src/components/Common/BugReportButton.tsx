import React, { useState, useRef, useEffect } from 'react';
import { Bug, X, Send, Image as ImageIcon, Loader, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';

export const BugReportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { themeColors } = useTheme();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!popupRef.current) return;
    const rect = popupRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !popupRef.current) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - popupRef.current.offsetWidth;
      const maxY = window.innerHeight - popupRef.current.offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Screenshot must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `bug-reports/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('bug-screenshots')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('bug-screenshots')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Screenshot upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast('Please describe the bug', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      const browserInfo = `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`;

      const { error } = await supabase.from('bug_reports').insert({
        user_id: user?.uid || null,
        user_email: user?.email || null,
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        browser_info: browserInfo,
        status: 'new',
      });

      if (error) throw error;

      showToast('Bug report submitted successfully! Thank you for your feedback.', 'success');
      setDescription('');
      setScreenshot(null);
      setScreenshotPreview(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      showToast('Failed to submit bug report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonGradient = `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accentSecondary})`;

  return (
    <>
      {/* Fixed Bug Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: buttonGradient,
          boxShadow: `0 8px 32px ${themeColors.shadow}`,
        }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full text-white transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Report a bug"
      >
        <Bug className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Draggable Bug Report Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <div
            ref={popupRef}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              background: themeColors.surface,
              borderColor: themeColors.border,
              boxShadow: `0 20px 60px ${themeColors.shadow}`,
            }}
            className="absolute w-[500px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl pointer-events-auto"
          >
            {/* Draggable Header */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                background: themeColors.surfaceHover,
                borderBottomColor: themeColors.border,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              className="flex items-center justify-between p-4 border-b rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <GripVertical style={{ color: themeColors.textMuted }} className="w-5 h-5" />
                <div
                  style={{
                    background: `${themeColors.accent}20`,
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                >
                  <Bug style={{ color: themeColors.accent }} className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ color: themeColors.text }} className="text-xl font-bold">
                    Report a Bug
                  </h3>
                  <p style={{ color: themeColors.textMuted }} className="text-sm">
                    Help us improve KroniQ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: themeColors.surface,
                  color: themeColors.textSecondary,
                }}
                className="w-8 h-8 rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label style={{ color: themeColors.textSecondary }} className="block text-sm font-medium mb-2">
                  Describe the bug *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect to happen?"
                  style={{
                    background: themeColors.input,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  }}
                  className="w-full h-32 px-4 py-3 border rounded-xl placeholder-opacity-50 focus:outline-none focus:border-opacity-70 transition-all resize-none"
                  required
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label style={{ color: themeColors.textSecondary }} className="block text-sm font-medium mb-2">
                  Screenshot (optional)
                </label>

                {screenshotPreview ? (
                  <div style={{ borderColor: themeColors.border }} className="relative rounded-xl overflow-hidden border group">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.textMuted,
                    }}
                    className="w-full h-24 border-2 border-dashed rounded-xl hover:border-opacity-70 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-sm">Click to upload screenshot</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* User Info Display */}
              {user && (
                <div
                  style={{
                    color: themeColors.textMuted,
                    background: themeColors.surface,
                  }}
                  className="text-xs rounded-lg p-3"
                >
                  Submitting as: {user.email}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                style={{
                  background: buttonGradient,
                  boxShadow: `0 8px 24px ${themeColors.shadow}`,
                }}
                className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Bug Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
