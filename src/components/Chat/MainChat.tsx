/**
 * MainChat Component - Using Supabase
 * Messages appear instantly like ChatGPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { getAIResponse as callSimpleAI } from '../../lib/simpleAI';
import { classifyIntent, shouldShowConfirmation, shouldAutoRoute } from '../../lib/intentClassifier';
import { ChatSidebar } from './ChatSidebar';
import { LandingView } from './LandingView';
import { MobileLandingView } from './MobileLandingView';
import { IntentDialog } from './IntentDialog';
import { FloatingNavbar } from '../Layout/FloatingNavbar';
import { AIModelSelector } from './AIModelSelector';
import { ChatInput } from './ChatInput';
import { ImageGenerator } from './ImageGenerator';
import { VideoGenerator } from './VideoGenerator';
import { VoiceoverGenerator } from './VoiceoverGenerator';
import { PricingModal } from '../Pages/PricingModal';
import {
  createProject,
  addMessage,
  getProjects,
  subscribeToProjects,
  subscribeToMessages,
  deleteProject,
  renameProject,
  Project,
  Message,
} from '../../lib/chatService';
import { getUserPreferences, generateSystemPrompt, UserPreferences } from '../../lib/userPreferences';

export const MainChat: React.FC = () => {
  const { showToast } = useToast();
  const { navigateTo } = useNavigation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntentDialog, setShowIntentDialog] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('grok-2');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [showVoiceoverGenerator, setShowVoiceoverGenerator] = useState(false);
  const [voiceoverText, setVoiceoverText] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getUserPreferences();
        console.log('✅ User preferences loaded:', prefs);
        setUserPreferences(prefs);
      } catch (error) {
        console.error('❌ Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Load projects on mount
  useEffect(() => {
    const unsubscribe = subscribeToProjects((loadedProjects) => {
      console.log('📦 Projects loaded:', loadedProjects.length);
      setProjects(loadedProjects);
    });

    return unsubscribe;
  }, []);

  // Load messages when project changes
  useEffect(() => {
    if (!activeProjectId) {
      setMessages([]);
      return;
    }

    console.log('🔄 Setting up real-time for project:', activeProjectId);

    const unsubscribe = subscribeToMessages(activeProjectId, (loadedMessages) => {
      console.log('💬 Real-time update - Messages:', loadedMessages.length);
      setMessages(loadedMessages);
    });

    return () => {
      console.log('🔌 Unsubscribing from:', activeProjectId);
      unsubscribe();
    };
  }, [activeProjectId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI classification with Groq
  const classifyIntentWithAI = async (message: string): Promise<any> => {
    try {
      const keywordIntent = classifyIntent(message);

      if (!keywordIntent) {
        throw new Error('Keyword classification failed');
      }

      // Always use keyword intent - skip AI classification to avoid extra API calls
      console.log('✅ Using keyword intent:', keywordIntent);
      return keywordIntent;
    } catch (error) {
      console.error('❌ Intent classification completely failed:', error);
      // Return safe default
      return {
        intent: 'chat',
        confidence: 1.0,
        suggestedStudio: 'Chat Studio',
        reasoning: 'Defaulted to chat due to classification error'
      };
    }
  };

  // Generate dynamic project name from user message
  const generateProjectName = (message: string): string => {
    // Take first 40 chars and make it title-case
    let name = message.substring(0, 40).trim();

    // Remove trailing punctuation
    name = name.replace(/[.!?,;:]$/, '');

    // Add ellipsis if truncated
    if (message.length > 40) {
      name += '...';
    }

    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return name || 'New Chat';
  };

  // Send message
  const handleSendMessage = async (messageText?: string) => {
    console.log('🚀 handleSendMessage CALLED!');
    console.log('📝 messageText:', messageText);
    console.log('📝 inputValue:', inputValue);

    const textToSend = messageText || inputValue.trim();
    console.log('📝 textToSend:', textToSend);
    console.log('⏳ isLoading:', isLoading);

    if (!textToSend || isLoading) {
      console.warn('⚠️ BLOCKED: textToSend empty or already loading');
      return;
    }

    // Auto-detect voiceover generation requests
    const voiceKeywords = /\b(generate|create|make|produce|convert)\b.*\b(voice|voiceover|speech|audio|narration|speak|say)\b/i;
    const voiceRequestPattern = /\b(voice|voiceover|speech|audio|narration) (of|for|saying|speaking)\b/i;
    const sayPattern = /\b(say|speak|narrate)\b.*["\'](.+)["\']/i;

    if (voiceKeywords.test(textToSend) || voiceRequestPattern.test(textToSend) || sayPattern.test(textToSend)) {
      console.log('🎤 Voiceover generation detected!');
      setInputValue('');

      let cleanText = textToSend;

      const sayMatch = textToSend.match(/\b(say|speak|narrate)\b.*["\'](.+)["\']/i);
      if (sayMatch && sayMatch[2]) {
        cleanText = sayMatch[2];
      } else {
        cleanText = textToSend
          .replace(/^(generate|create|make|produce|convert)\s+(a|an)?\s+(voice|voiceover|speech|audio|narration)\s+(of|for|saying|speaking)?\s*/i, '')
          .replace(/\b(that says?|speaking|saying)\b\s*/i, '')
          .trim();
      }

      setVoiceoverText(cleanText || textToSend);
      setShowVoiceoverGenerator(true);

      return;
    }

    // Auto-detect video generation requests
    const videoKeywords = /\b(generate|create|make|show|render|produce)\b.*\b(video|clip|animation|footage|movie)\b/i;
    const videoRequestPattern = /\b(video|clip|animation) (of|about|showing|with|depicting)\b/i;

    if (videoKeywords.test(textToSend) || videoRequestPattern.test(textToSend)) {
      console.log('🎬 Video generation detected!');
      setInputValue('');

      const cleanPrompt = textToSend
        .replace(/^(generate|create|make|show|render|produce)\s+(a|an)?\s+(video|clip|animation|footage|movie)\s+(of|about|showing|with|depicting)?\s*/i, '')
        .trim();

      setVideoPrompt(cleanPrompt || textToSend);
      setShowVideoGenerator(true);

      return;
    }

    // Auto-detect image generation requests
    const imageKeywords = /\b(generate|create|make|draw|design|show|paint|illustrate|render)\b.*\b(image|picture|photo|illustration|artwork|art|painting|drawing|graphic)\b/i;
    const imageRequestPattern = /\b(image|picture|photo|illustration) (of|about|showing|with|depicting)\b/i;

    if (imageKeywords.test(textToSend) || imageRequestPattern.test(textToSend)) {
      console.log('🎨 Image generation detected!');
      setInputValue('');

      // Extract the prompt (remove command words)
      const cleanPrompt = textToSend
        .replace(/^(generate|create|make|draw|design|show|paint|illustrate|render)\s+(an?\s+)?(image|picture|photo|illustration|artwork|art|painting|drawing|graphic)\s+(of|about|showing|with|depicting)?\s*/i, '')
        .trim();

      setImagePrompt(cleanPrompt || textToSend);
      setShowImageGenerator(true);

      return;
    }

    setInputValue('');
    setIsLoading(true);

    try {
      console.log('📤 Sending:', textToSend);

      // Classify intent - use safe default if it fails
      let intent;
      try {
        intent = await classifyIntentWithAI(textToSend);
        if (!intent) {
          throw new Error('No intent returned');
        }
        console.log('🎯 Intent classified:', intent.intent, intent.confidence);
      } catch (error) {
        console.warn('⚠️ Intent classification failed, defaulting to chat:', error);
        intent = {
          intent: 'chat',
          confidence: 1.0,
          suggestedStudio: 'Chat Studio',
          reasoning: 'Intent classification failed, defaulting to chat'
        };
      }

      // Handle studio intents
      if ((intent.intent === 'code' || intent.intent === 'design' || intent.intent === 'video' || intent.intent === 'voice') && !activeProjectId) {
        if (shouldShowConfirmation(intent)) {
          setPendingIntent({ intent, message: textToSend });
          setShowIntentDialog(true);
          setIsLoading(false);
          return;
        } else if (shouldAutoRoute(intent)) {
          await handleIntentConfirm({ intent, message: textToSend });
          setIsLoading(false);
          return;
        }
      }

      // Create or use chat project
      let projectId = activeProjectId;
      if (!projectId) {
        const projectName = generateProjectName(textToSend);
        const project = await createProject(projectName, 'chat', textToSend.substring(0, 100));
        projectId = project.id;
        setActiveProjectId(projectId);
        console.log('✅ Project created:', projectId, 'Name:', projectName);
      }

      // Add user message
      await addMessage(projectId, 'user', textToSend);

      // Get AI response
      await getAIResponse(projectId, textToSend);

    } catch (error: any) {
      console.error('❌ Error:', error);
      showToast('error', 'Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI response - SIMPLE VERSION
  const getAIResponse = async (projectId: string, userMessage: string) => {
    try {
      console.log('🚀 getAIResponse called with:', { projectId, userMessage: userMessage.substring(0, 50) });

      // Build conversation history
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      console.log('📝 Messages count:', conversationHistory.length);
      console.log('⏳ Calling SIMPLE AI service...');

      // Generate custom system prompt based on user preferences
      const systemPrompt = userPreferences
        ? generateSystemPrompt(userPreferences)
        : undefined;

      console.log('🎯 Using custom preferences:', !!systemPrompt);

      // Call simple AI service with user preferences
      const aiContent = await callSimpleAI(userMessage, conversationHistory, systemPrompt);

      console.log('✅ AI Response received! Length:', aiContent.length);
      console.log('✅ First 100 chars:', aiContent.substring(0, 100));

      // Save AI response
      console.log('💾 Saving AI response to database...');
      await addMessage(projectId, 'assistant', aiContent);
      console.log('✅ AI response saved successfully');

    } catch (error: any) {
      console.error('❌❌❌ AI ERROR ❌❌❌');
      console.error('Error type:', error.constructor?.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      const errorMessage = error.message || 'Unknown error occurred';
      const fallback = `⚠️ **AI Error**\n\n${errorMessage}\n\n**Troubleshooting:**\n1. Check that VITE_GROQ_API_KEY is set in .env file\n2. Make sure the API key is valid (get free key at console.groq.com)\n3. Check browser console (F12) for detailed error logs\n4. Try refreshing the page\n\n**Your message:** "${userMessage}"`;

      console.log('💾 Saving error message to chat...');
      await addMessage(projectId, 'assistant', fallback);
      console.log('✅ Error message saved to chat');

      showToast('error', 'AI Error', errorMessage);
    }
  };

  // Handle intent confirmation
  const handleIntentConfirm = async (data: { intent: any; message: string }) => {
    setShowIntentDialog(false);
    setPendingIntent(null);

    const { intent, message } = data;

    try {
      const project = await createProject(
        `${intent.intent} Project`,
        intent.intent,
        message.substring(0, 100)
      );

      // Navigate to studio
      setTimeout(() => {
        const studioMap = {
          code: 'code',
          design: 'design',
          video: 'video',
          voice: 'voice',
        };
        const destination = studioMap[intent.intent as keyof typeof studioMap];
        if (destination) {
          navigateTo(destination as any, project as any);
        } else {
          console.error(`No route found for intent: ${intent.intent}`);
          navigateTo('chat');
        }
      }, 300);

    } catch (error: any) {
      console.error('❌ Error:', error);
      showToast('error', 'Error', error.message);
    }
  };

  // New chat - clear active project to show landing page
  const handleNewChat = () => {
    setActiveProjectId(null);
    setMessages([]);
    showToast('success', 'New Chat', 'Ready to start a new conversation');
  };

  // Select project
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  // Key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Rename project
  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      await renameProject(projectId, newName);
      showToast('success', 'Success', 'Project renamed successfully');
    } catch (error: any) {
      console.error('❌ Error renaming project:', error);
      showToast('error', 'Error', 'Failed to rename project');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);

      // If the deleted project was active, clear it
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setMessages([]);
      }

      showToast('success', 'Success', 'Project deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast('error', 'Error', error.message || 'Failed to delete project');
    }
  };

  const showLanding = !activeProjectId;

  return (
    <div className="flex h-screen overflow-hidden">
      <FloatingNavbar />

      <ChatSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onNewChat={handleNewChat}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      <div className="flex-1 flex flex-col pt-0 md:pt-20 overflow-hidden">
        <div className="flex-1 ml-0 md:ml-16 overflow-y-auto px-2 md:px-4">
          {showLanding ? (
            <>
              {/* Mobile Landing View */}
              <div className="md:hidden h-full">
                <MobileLandingView
                  onQuickAction={(text) => handleSendMessage(text)}
                  input={inputValue}
                  setInput={setInputValue}
                  onSendMessage={() => handleSendMessage(inputValue)}
                />
              </div>
              {/* Desktop Landing View */}
              <div className="hidden md:block">
                <LandingView
                  onQuickAction={(text) => handleSendMessage(text)}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </>
          ) : (
            <>
              {/* Mobile Get Plus Button - Top Right */}
              <div className="md:hidden fixed top-3 right-3 z-20">
                <button
                  onClick={() => setShowPricing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 rounded-full text-white text-xs font-medium transition-all active:scale-95 shadow-lg border border-white/20"
                >
                  Get Plus
                </button>
              </div>

              {/* Messages Area */}
              <div className="px-4 md:px-6 py-6 md:py-8 space-y-6 pb-32">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 ring-2 ring-cyan-400/30'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-400/30'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-full md:max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block rounded-2xl px-4 md:px-5 py-2.5 md:py-3 shadow-xl transition-all hover:shadow-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/20'
                        : 'glass-panel border border-white/10 text-white/95 hover:border-white/20'
                    }`}>
                      <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    </div>
                    <div className={`text-[10px] md:text-xs mt-1.5 px-2 ${
                      message.role === 'user' ? 'text-white/50' : 'text-white/40'
                    }`}>
                      {message.created_at && new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#00FFF0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#00FFF0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#00FFF0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            </>
          )}
        </div>

        {/* Input Area - Mobile/Desktop Optimized */}
        {!showLanding && (
          <>
            {/* Desktop View - Original Chat Input */}
            <div className="hidden md:block border-t border-white/10 bg-slate-900/80 backdrop-blur-xl p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                  <AIModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    category="chat"
                  />
                </div>
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => handleSendMessage()}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Kroniq anything..."
                  disabled={isLoading}
                  selectedModel={selectedModel}
                />
              </div>
            </div>

            {/* Mobile View - Simple ChatGPT-style Input */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel backdrop-blur-2xl border-t border-white/10 p-3 safe-bottom z-20">
              <div className="flex items-center gap-2">
                {/* Model Selector - Compact */}
                <div className="flex-shrink-0">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-12 h-10 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-white text-xs font-medium appearance-none text-center cursor-pointer transition-all"
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="groq-llama-3.3-70b" className="bg-slate-900">🦙</option>
                    <option value="groq-llama-3.1-70b" className="bg-slate-900">🦙</option>
                    <option value="groq-mixtral-8x7b" className="bg-slate-900">🤖</option>
                  </select>
                </div>

                {/* Input Container */}
                <div className="flex-1 bg-white/10 border border-white/20 rounded-[26px] px-4 py-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-[15px]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className={`flex-shrink-0 p-2 rounded-full transition-all active:scale-95 ${
                      inputValue.trim() && !isLoading
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/20 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showIntentDialog && pendingIntent && pendingIntent.intent && (
        <IntentDialog
          intent={pendingIntent.intent}
          onConfirm={() => handleIntentConfirm(pendingIntent)}
          onCancel={() => {
            setShowIntentDialog(false);
            setPendingIntent(null);
            setIsLoading(false);
          }}
        />
      )}

      {showImageGenerator && (
        <ImageGenerator
          onClose={() => {
            setShowImageGenerator(false);
            setImagePrompt('');
          }}
          onImageGenerated={(image) => {
            showToast('success', 'Success', 'Image generated! You can download it now.');
            console.log('Generated image:', image);
          }}
          initialPrompt={imagePrompt}
        />
      )}

      {showVideoGenerator && (
        <VideoGenerator
          onClose={() => {
            setShowVideoGenerator(false);
            setVideoPrompt('');
          }}
          initialPrompt={videoPrompt}
        />
      )}

      {showVoiceoverGenerator && (
        <VoiceoverGenerator
          onClose={() => {
            setShowVoiceoverGenerator(false);
            setVoiceoverText('');
          }}
          initialText={voiceoverText}
        />
      )}

      {showPricing && (
        <PricingModal onClose={() => setShowPricing(false)} />
      )}
    </div>
  );
};
