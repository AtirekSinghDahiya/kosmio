/**
 * MainChat Component - Using Supabase
 * Messages appear instantly like ChatGPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { callAI } from '../../lib/aiProviders';
import { classifyIntent, shouldShowConfirmation, shouldAutoRoute } from '../../lib/intentClassifier';
import { ChatSidebar } from './ChatSidebar';
import { LandingView } from './LandingView';
import { IntentDialog } from './IntentDialog';
import { FloatingNavbar } from '../Layout/FloatingNavbar';
import { AIModelSelector } from './AIModelSelector';
import { ChatInput } from './ChatInput';
import {
  createProject,
  addMessage,
  getProjects,
  subscribeToProjects,
  subscribeToMessages,
  deleteProject,
  Project,
  Message,
} from '../../lib/chatService';

export const MainChat: React.FC = () => {
  const { showToast } = useToast();
  const { navigateTo } = useNavigation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntentDialog, setShowIntentDialog] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('grok-2');

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

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

  // Get AI response
  const getAIResponse = async (projectId: string, userMessage: string) => {
    try {
      console.log('🚀 getAIResponse called with:', { projectId, userMessage: userMessage.substring(0, 50) });

      // Build conversation history
      const conversationMessages = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      conversationMessages.push({ role: 'user', content: userMessage });

      console.log('🤖 Calling AI with model:', selectedModel);
      console.log('📝 Messages count:', conversationMessages.length);
      console.log('📝 Last message:', conversationMessages[conversationMessages.length - 1]);

      // Get AI response
      console.log('⏳ About to call AI...');
      const aiResponse = await callAI(conversationMessages, selectedModel);
      console.log('✅ AI Response received! Length:', aiResponse.content.length);
      console.log('✅ First 100 chars:', aiResponse.content.substring(0, 100));

      // Save AI response
      console.log('💾 Saving AI response to database...');
      await addMessage(projectId, 'assistant', aiResponse.content);
      console.log('✅ AI response saved successfully');

    } catch (error: any) {
      console.error('❌ AI Error Details:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));

      const errorMessage = error.message || 'Unknown error';
      const fallback = `⚠️ AI Error: ${errorMessage}\n\nPlease check:\n1. API key is configured in .env\n2. API key is valid\n3. Check browser console for details\n\nYour message was: "${userMessage}"`;
      await addMessage(projectId, 'assistant', fallback);
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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <FloatingNavbar />

      <ChatSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onNewChat={handleNewChat}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      <div className="flex-1 flex flex-col ml-16">
        {showLanding ? (
          <LandingView
            onQuickAction={(text) => handleSendMessage(text)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/10 backdrop-blur-md border border-white/10 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-cyan-100' : 'text-gray-400'
                    }`}>
                      {message.created_at && new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-2xl px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl p-4">
              <div className="max-w-4xl mx-auto">
                <div className="mb-3">
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
                  placeholder="Ask Kosmio anything..."
                  disabled={isLoading}
                  selectedModel={selectedModel}
                />
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
    </div>
  );
};
