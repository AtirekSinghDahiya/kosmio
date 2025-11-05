/**
 * MainChat Component - Using Supabase
 * Messages appear instantly like ChatGPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, RotateCw, Copy, MoreHorizontal } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getOpenRouterResponse, getOpenRouterResponseWithUsage } from '../../lib/openRouterService';
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
import { MusicGenerator } from './MusicGenerator';
import { getModelCost, isModelFree } from '../../lib/modelTokenPricing';
import { checkPremiumAccess } from '../../lib/premiumAccessService';
import {
  createProject,
  addMessage,
  getProjects,
  subscribeToProjects,
  subscribeToMessages,
  generateAIProjectName,
  deleteProject,
  renameProject,
  Project,
  Message,
} from '../../lib/chatService';
import { getUserPreferences, generateSystemPrompt, UserPreferences } from '../../lib/userPreferences';
import { checkFeatureAccess, incrementUsage } from '../../lib/subscriptionService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useStudioMode } from '../../contexts/StudioModeContext';

export const MainChat: React.FC = () => {
  const { showToast } = useToast();
  const { navigateTo } = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { setMode, setProjectId: setStudioProjectId } = useStudioMode();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntentDialog, setShowIntentDialog] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('grok-4-fast');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [showVoiceoverGenerator, setShowVoiceoverGenerator] = useState(false);
  const [voiceoverText, setVoiceoverText] = useState('');
  const [showMusicGenerator, setShowMusicGenerator] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update studio mode context when generators are shown
  useEffect(() => {
    if (showImageGenerator) {
      setMode('image');
      setStudioProjectId(activeProjectId);
    } else if (showVideoGenerator) {
      setMode('video');
      setStudioProjectId(activeProjectId);
    } else if (showMusicGenerator) {
      setMode('music');
      setStudioProjectId(activeProjectId);
    } else if (showVoiceoverGenerator) {
      setMode('voice');
      setStudioProjectId(activeProjectId);
    } else {
      setMode('chat');
      setStudioProjectId(activeProjectId);
    }
  }, [showImageGenerator, showVideoGenerator, showMusicGenerator, showVoiceoverGenerator, activeProjectId, setMode, setStudioProjectId]);

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

  // AI classification using keywords
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
  const handleSendMessage = async (messageText?: string, attachments?: File[]) => {
    console.log('🚀 handleSendMessage CALLED!');
    console.log('📝 messageText:', messageText);
    console.log('📝 inputValue:', inputValue);
    console.log('📎 attachments:', attachments?.length || 0);

    const textToSend = messageText || inputValue.trim();
    console.log('📝 textToSend:', textToSend);
    console.log('⏳ isLoading:', isLoading);

    if ((!textToSend && (!attachments || attachments.length === 0)) || isLoading) {
      console.warn('⚠️ BLOCKED: No text or attachments, or already loading');
      return;
    }

    // CRITICAL: Check token balance FIRST - Block if 0 tokens
    const { data: profile } = await supabase
      .from('profiles')
      .select('tokens_balance, free_tokens_balance, paid_tokens_balance')
      .eq('id', user?.uid)
      .maybeSingle();

    const totalTokens = (profile?.tokens_balance || 0);
    console.log('💰 Current token balance:', totalTokens);

    if (totalTokens <= 0) {
      showToast('error', 'No Tokens Remaining', 'You have 0 tokens. Please purchase tokens or upgrade your plan to continue chatting.');
      return;
    }

    const messageAccess = await checkFeatureAccess('chat_messages_daily');
    if (!messageAccess.allowed) {
      showToast('error', 'Daily Limit Reached', `You've reached your daily message limit of ${messageAccess.limit} messages. Upgrade your plan to send more messages.`);
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

    // Auto-detect video generation requests - INLINE in chat
    const videoKeywords = /\b(generate|create|make|show|render|produce)\b.*\b(video|clip|animation|footage|movie)\b/i;
    const videoRequestPattern = /\b(video|clip|animation) (of|about|showing|with|depicting)\b/i;

    if (videoKeywords.test(textToSend) || videoRequestPattern.test(textToSend)) {
      console.log('🎬 Video generation detected - generating inline!');
      setInputValue('');

      const cleanPrompt = textToSend
        .replace(/^(generate|create|make|show|render|produce)\s+(a|an)?\s+(video|clip|animation|footage|movie)\s+(of|about|showing|with|depicting)?\s*/i, '')
        .trim();

      const finalPrompt = cleanPrompt || textToSend;
      setIsLoading(true);

      try {
        // Create or use project
        let projectId = activeProjectId;
        if (!projectId) {
          const project = await createProject('Video Generation', 'chat', finalPrompt);
          projectId = project.id;
          setActiveProjectId(projectId);
        }

        // Add user message
        await addMessage(projectId, 'user', textToSend, []);

        // Add generating message
        const generatingMsg = await addMessage(projectId, 'assistant', '🎬 Generating video... This may take 2-3 minutes.', []);

        // Generate video - using Runway
        const { runwayService } = await import('../../lib/runwayService');
        const result = await runwayService.generateVideo(finalPrompt);

        if (result && result.videoUrl) {
          console.log('✅ Video generated:', result.videoUrl);

          // Update message with video player
          await supabase
            .from('messages')
            .update({
              content: `Here's your generated video:`,
              file_attachments: [{
                id: Date.now().toString(),
                type: 'video/mp4',
                url: result.videoUrl,
                name: 'generated-video.mp4',
                size: 0
              }]
            })
            .eq('id', generatingMsg.id);

          await loadMessages(projectId);
          showToast('success', 'Video Generated', 'Your video is ready!');
        } else {
          throw new Error('Video generation failed');
        }
      } catch (error: any) {
        console.error('❌ Video generation error:', error);
        showToast('error', 'Generation Failed', error.message || 'Failed to generate video');
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // Auto-detect music generation requests - INLINE in chat
    const musicKeywords = /\b(generate|create|make|compose|produce|write)\b.*\b(music|song|track|tune|beat|melody|soundtrack|audio|composition)\b/i;
    const musicRequestPattern = /\b(music|song|track|tune) (about|for|with|depicting)\b/i;

    if (musicKeywords.test(textToSend) || musicRequestPattern.test(textToSend)) {
      console.log('🎵 Music generation detected - generating inline!');
      setInputValue('');

      // Extract the prompt (remove command words)
      const cleanPrompt = textToSend
        .replace(/^(generate|create|make|compose|produce|write)\s+(an?\s+)?(music|song|track|tune|beat|melody|soundtrack|audio|composition)\s+(about|for|with|depicting)?\s*/i, '')
        .trim();

      const finalPrompt = cleanPrompt || textToSend;
      setIsLoading(true);

      try {
        // Create or use project
        let projectId = activeProjectId;
        if (!projectId) {
          const project = await createProject('Music Generation', 'chat', finalPrompt);
          projectId = project.id;
          setActiveProjectId(projectId);
        }

        // Add user message
        await addMessage(projectId, 'user', textToSend, []);

        // Add generating message
        const generatingMsg = await addMessage(projectId, 'assistant', '🎵 Generating music... This may take 1-2 minutes.', []);

        // Generate music
        const { sunoService } = await import('../../lib/sunoService');
        const result = await sunoService.generateMusic({
          prompt: finalPrompt,
          makeInstrumental: false
        });

        if (result && result.songs && result.songs.length > 0) {
          const song = result.songs[0];
          console.log('✅ Music generated:', song);

          // Update message with audio player
          await supabase
            .from('messages')
            .update({
              content: `Here's your generated music: "${song.title}"`,
              file_attachments: [{
                id: song.id,
                type: 'audio/mpeg',
                url: song.audioUrl,
                name: `${song.title}.mp3`,
                size: 0
              }]
            })
            .eq('id', generatingMsg.id);

          await loadMessages(projectId);
          showToast('success', 'Music Generated', 'Your music is ready!');
        } else {
          throw new Error('Music generation failed');
        }
      } catch (error: any) {
        console.error('❌ Music generation error:', error);
        showToast('error', 'Generation Failed', error.message || 'Failed to generate music');
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // Auto-detect PPT/presentation generation requests
    const pptKeywords = /\b(generate|create|make|build|design|produce|prepare)\b.*\b(ppt|powerpoint|presentation|slides?|slideshow|deck)\b/i;
    const pptRequestPattern = /\b(presentation|slides?|ppt|powerpoint|slideshow|deck) (on|about|for|regarding|covering)\b/i;
    const pptDirectPattern = /\b(make|need|want|create|build)\s+(a|an)?\s*(presentation|slides?|ppt|powerpoint|slideshow)/i;

    if (pptKeywords.test(textToSend) || pptRequestPattern.test(textToSend) || pptDirectPattern.test(textToSend)) {
      console.log('📊 PPT generation detected! Navigating to PPT Studio...');
      setInputValue('');

      showToast('success', 'Opening PPT Studio', 'Let\'s create your presentation!');

      setTimeout(() => {
        navigateTo('ppt');
      }, 500);

      return;
    }

    // Handle file attachments - upload them
    let uploadedFiles: any[] = [];
    if (attachments && attachments.length > 0) {
      console.log('📎 Files attached:', attachments.length);
      showToast('info', 'Uploading Files...', `Uploading ${attachments.length} file(s)...`);

      try {
        const { FileUploadService } = await import('../../lib/fileUploadService');
        uploadedFiles = await FileUploadService.uploadMultipleFiles(attachments, user!.uid);

        if (uploadedFiles.length > 0) {
          showToast('success', 'Files Uploaded', `${uploadedFiles.length} file(s) uploaded successfully`);
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        showToast('error', 'Upload Failed', 'Failed to upload files. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    // Auto-detect image generation requests - INLINE, NOT POPUP
    const imageKeywords = /\b(generate|create|make|draw|design|show|paint|illustrate|render)\b.*\b(image|picture|photo|illustration|artwork|art|painting|drawing|graphic)\b/i;
    const imageRequestPattern = /\b(image|picture|photo|illustration) (of|about|showing|with|depicting)\b/i;

    if (imageKeywords.test(textToSend) || imageRequestPattern.test(textToSend)) {
      console.log('🎨 Image generation detected - will generate inline!');
      setInputValue('');

      // Extract the prompt (remove command words)
      const cleanPrompt = textToSend
        .replace(/^(generate|create|make|draw|design|show|paint|illustrate|render)\s+(an?\s+)?(image|picture|photo|illustration|artwork|art|painting|drawing|graphic)\s+(of|about|showing|with|depicting)?\s*/i, '')
        .trim();

      const finalPrompt = cleanPrompt || textToSend;

      // Create user message
      const userMsg = await addMessage(activeProjectId!, 'user', `Generate an image: ${finalPrompt}`);

      // Create generating message
      const generatingMsg = await addMessage(activeProjectId!, 'assistant', 'Generating image...');

      // Import and use image service
      try {
        console.log('🎨 Starting image generation with prompt:', finalPrompt);
        const { generateImageFree } = await import('../../lib/imageService');
        const result = await generateImageFree(finalPrompt);
        console.log('🎨 Image generation result:', result);

        if (result && result.url) {
          console.log('✅ Image generated successfully! URL:', result.url);
          // Update message with generated image
          await supabase
            .from('messages')
            .update({
              content: `Here's your generated image:`,
              file_attachments: [{
                id: Date.now().toString(),
                type: 'image/png',
                url: result.url,
                name: 'generated-image.png',
                size: 0
              }]
            })
            .eq('id', generatingMsg.id);

          // Force reload messages to show the image
          await loadMessages(activeProjectId!);

          showToast('success', 'Image Generated', 'Your image is ready!');
        } else {
          throw new Error(result.error || 'Image generation failed');
        }
      } catch (error: any) {
        console.error('❌ Image generation error:', error);
        await supabase
          .from('messages')
          .update({ content: `Failed to generate image: ${error.message}. Please try again.` })
          .eq('id', generatingMsg.id);
        showToast('error', 'Generation Failed', error.message || 'Failed to generate image');
      }

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

        // If a specific AI model was detected, auto-select it
        if (intent.suggestedModel && intent.suggestedModel !== selectedModel) {
          console.log(`🤖 Auto-selecting AI model: ${intent.suggestedModel}`);
          setSelectedModel(intent.suggestedModel);
          showToast('info', 'Model Selected', `Using ${intent.suggestedModel} as requested`);
        }
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
      if ((intent.intent === 'code' || intent.intent === 'design' || intent.intent === 'video' || intent.intent === 'voice' || intent.intent === 'music' || intent.intent === 'image') && !activeProjectId) {
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
        // Generate AI-powered project name
        console.log('🤖 Generating AI project name...');
        const projectName = await generateAIProjectName(textToSend);
        console.log('✅ AI-generated project name:', projectName);

        const project = await createProject(projectName, 'chat', textToSend.substring(0, 100));
        projectId = project.id;
        setActiveProjectId(projectId);
        console.log('✅ Project created:', projectId, 'Name:', projectName);
      }

      // Add user message with attachments
      if (uploadedFiles.length > 0) {
        const fileAttachments = uploadedFiles.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          url: f.url
        }));

        await supabase.from('messages').insert({
          project_id: projectId,
          role: 'user',
          content: textToSend,
          file_attachments: fileAttachments
        });
      } else {
        await addMessage(projectId, 'user', textToSend, []);
      }

      // Get AI response
      await getAIResponse(projectId, textToSend);

    } catch (error: any) {
      console.error('❌ Error:', error);
      showToast('error', 'Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI response with tier-based access control and 2x price multiplier
  const getAIResponse = async (projectId: string, userMessage: string) => {
    if (!user) {
      showToast('error', 'Authentication Required', 'Please sign in to use AI features');
      return;
    }

    try {
      console.log('🚀 getAIResponse called with:', { projectId, userMessage: userMessage.substring(0, 50) });
      console.log('🤖 Using model:', selectedModel);

      // Step 1: Validate model access based on user tier
      const modelInfo = getModelCost(selectedModel);
      const isFree = isModelFree(selectedModel);

      if (!isFree) {
        const access = await checkPremiumAccess(user.uid);
        console.log('🔑 [MAIN CHAT] Checking premium model access:', {
          model: selectedModel,
          tier: modelInfo.tier,
          isPremium: access.isPremium,
          tierSource: access.tierSource,
          paidTokens: access.paidTokens
        });

        if (!access.isPremium) {
          console.error(`🚫 Access denied: User ${user.uid} tried to use premium model ${selectedModel}`);
          showToast('error', 'Premium Model Locked', `${modelInfo.name} is a premium model. Purchase tokens to unlock access to premium models.`);

          const fallbackMessage = `⚠️ **Access Denied**\n\nThe model "${modelInfo.name}" (${modelInfo.provider}) requires a paid tier.\n\n**Why is this locked?**\n- This is a ${modelInfo.tier} tier model\n- Cost: ${modelInfo.tokensPerMessage.toLocaleString()} tokens per message\n- Free tier users can only access free models\n\n**To unlock this model:**\n1. Go to Settings → Billing\n2. Purchase a token pack\n3. All premium models will unlock immediately\n\n**Free alternatives you can use:**\n- Grok 4 Fast (Recommended)\n- DeepSeek V3.1 Free\n- Claude 3 Haiku\n- Gemini Flash Lite Free\n\nPlease select a free model from the dropdown to continue.`;

          await addMessage(projectId, 'assistant', fallbackMessage);
          return;
        }

        console.log(`✅ Access granted: User ${user.uid} has premium access for ${selectedModel}`);
      } else {
        console.log(`✅ Free model ${selectedModel} - access granted to all users`);
      }

      // Step 2: Build conversation history
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

      console.log('📝 Messages count:', conversationHistory.length);

      // Step 3: Generate custom system prompt
      const systemPrompt = userPreferences
        ? generateSystemPrompt(userPreferences)
        : undefined;

      console.log('🎯 Using custom preferences:', !!systemPrompt);

      // Step 4: Call OpenRouter service with usage tracking
      const aiResponse = await getOpenRouterResponseWithUsage(userMessage, conversationHistory, systemPrompt, selectedModel);
      const aiContent = aiResponse.content;

      console.log('✅ AI Response received! Length:', aiContent.length);
      console.log('✅ First 100 chars:', aiContent.substring(0, 100));

      // Step 5: Deduct tokens with 2x multiplier based on OpenRouter cost
      console.log('💰 Processing token deduction...');
      console.log('💰 aiResponse.usage:', aiResponse.usage);

      // Get the actual cost from OpenRouter (or use fallback)
      const estimatedFallbackCost = Math.max(0.0005, (aiContent.length / 1000) * 0.0005);
      const openRouterCost = aiResponse.usage?.total_cost || estimatedFallbackCost;

      console.log(`💰 OpenRouter cost: $${openRouterCost.toFixed(6)}`);

      // Apply 2x multiplier to OpenRouter cost
      const finalCostUSD = openRouterCost * 2;

      // Convert USD to tokens (1 token = $0.000001, so $1 = 1,000,000 tokens)
      const tokensToDeduct = Math.ceil(finalCostUSD * 1000000);

      console.log(`💰 Final cost (2x): $${finalCostUSD.toFixed(6)}`);
      console.log(`💎 Tokens to deduct: ${tokensToDeduct.toLocaleString()}`);

      // Deduct tokens from user's balance
      let deductionSuccess = false;
      try {
        console.log('🔄 Calling deduct_tokens_simple with:', { user_id: user.uid, tokens: tokensToDeduct });

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_tokens_simple', {
          p_user_id: user.uid,
          p_tokens: tokensToDeduct
        });

        console.log('📊 Deduction result:', { deductResult, deductError });

        if (deductError) {
          console.error('❌ Token deduction error:', deductError);
          // Don't show error toast - just log it
        } else if (deductResult && deductResult.success) {
          console.log(`✅ Deducted ${tokensToDeduct.toLocaleString()} tokens. New balance: ${deductResult.new_balance?.toLocaleString()}`);
          deductionSuccess = true;
        } else {
          console.warn('⚠️ Token deduction returned success=false:', deductResult);
        }
      } catch (deductErr: any) {
        console.error('❌ Exception during token deduction:', deductErr);
        console.error('❌ Error details:', JSON.stringify(deductErr, null, 2));
        // Don't show error toast - AI response was successful
      }

      // Log usage to database for tracking and analytics
      try {
        await supabase.from('ai_usage_logs').insert({
          user_id: user.uid,
          model: selectedModel,
          provider: aiResponse.provider || 'OpenRouter',
          request_type: 'chat',
          prompt: userMessage.substring(0, 500),
          response_length: aiContent.length,
          tokens_used: tokensToDeduct,
          openrouter_cost_usd: openRouterCost,
          final_cost_usd: finalCostUSD,
          success: deductionSuccess,
          metadata: {
            usage: aiResponse.usage,
            project_id: projectId
          }
        });
        console.log('✅ Usage logged to database');
      } catch (logErr) {
        console.error('⚠️ Failed to log usage:', logErr);
      }

      // Step 6: Save AI response
      console.log('💾 Saving AI response to database...');
      await addMessage(projectId, 'assistant', aiContent);
      console.log('✅ AI response saved successfully');

      await incrementUsage('chat_messages_daily', 1);
      console.log('✅ Message usage incremented');

    } catch (error: any) {
      console.error('❌❌❌ AI ERROR ❌❌❌');
      console.error('Error type:', error.constructor?.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      const errorMessage = error.message || 'Unknown error occurred';

      let troubleshooting = `**Troubleshooting:**\n1. Check your internet connection\n2. Try selecting a different AI model from the dropdown\n3. Check browser console (F12) for detailed error logs\n4. Try refreshing the page`;

      if (errorMessage.includes('User not found') || errorMessage.includes('Authentication')) {
        troubleshooting = `**This appears to be an API key issue.**\n\n**To fix:**\n1. Go to https://openrouter.ai/ and sign up/login\n2. Get your API key from https://openrouter.ai/keys\n3. Update the key in src/lib/openRouterService.ts (line 17)\n4. The current key may be invalid or expired\n\n**For developers:**\nCheck the browser console (F12) for detailed error information.`;
      }

      const fallback = `⚠️ **AI Error**\n\n${errorMessage}\n\n${troubleshooting}\n\n**Your message:** "${userMessage}"`;

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
          music: 'voice',
          image: 'chat',
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
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
              {/* Desktop Landing View */}
              <div className="hidden md:block">
                <LandingView
                  onQuickAction={(text, files) => handleSendMessage(text, files)}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </>
          ) : (
            <>
              {/* Messages Area */}
              <div className="max-w-4xl mx-auto py-8 space-y-6 pb-32">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar - Left for AI, Right for User */}
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      <img src="/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png" alt="KroniQ" className="w-8 h-8" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] text-white rounded-br-md'
                        : theme === 'light'
                        ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                        : 'bg-gray-800/50 text-gray-100 rounded-bl-md'
                    } backdrop-blur-sm shadow-lg`}>
                      <div className="text-[15px] leading-[1.6] whitespace-pre-wrap font-normal">
                        {message.content}
                      </div>

                      {/* Display Attachments */}
                      {message.file_attachments && (() => {
                        try {
                          // Handle both stringified and direct array
                          const attachments = typeof message.file_attachments === 'string'
                            ? JSON.parse(message.file_attachments)
                            : message.file_attachments;

                          if (Array.isArray(attachments) && attachments.length > 0) {
                            return (
                              <div className="mt-3 space-y-2">
                                {attachments.map((attachment: any, idx: number) => (
                                  <div key={idx}>
                                    {attachment.type === 'image' || attachment.type?.startsWith('image/') ? (
                                      <img
                                        src={attachment.url}
                                        alt={attachment.name || 'Attached image'}
                                        className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      />
                                    ) : attachment.type?.startsWith('audio/') ? (
                                      <div className="mt-2">
                                        <audio controls className="w-full max-w-md">
                                          <source src={attachment.url} type={attachment.type} />
                                          Your browser does not support the audio element.
                                        </audio>
                                        <p className="text-xs mt-1 opacity-70">🎵 {attachment.name || 'Audio file'}</p>
                                      </div>
                                    ) : attachment.type?.startsWith('video/') ? (
                                      <div className="mt-2">
                                        <video controls className="w-full max-w-2xl rounded-lg">
                                          <source src={attachment.url} type={attachment.type} />
                                          Your browser does not support the video element.
                                        </video>
                                        <p className="text-xs mt-1 opacity-70">🎬 {attachment.name || 'Video file'}</p>
                                      </div>
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                                      >
                                        <span>📎 {attachment.name || 'File'}</span>
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                        } catch (e) {
                          console.error('Error parsing attachments:', e);
                        }
                        return null;
                      })()}
                    </div>

                    {/* Action Buttons - Only for AI messages */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            showToast('success', 'Copied', 'Message copied to clipboard');
                          }}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => showToast('info', 'Coming Soon', 'Feedback feature coming soon!')}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => showToast('info', 'Coming Soon', 'Feedback feature coming soon!')}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Bad response"
                        >
                          <ThumbsDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            // Find the user message that prompted this response
                            const userMessage = messages[index - 1];
                            if (userMessage && userMessage.role === 'user') {
                              handleSendMessage(userMessage.content);
                            }
                          }}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Retry"
                        >
                          <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => showToast('info', 'Coming Soon', 'More actions coming soon!')}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar - Right for User */}
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFF0] to-[#8A2BE2] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    <img src="/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png" alt="KroniQ" className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                    theme === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'
                  } backdrop-blur-sm shadow-lg`}>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            </>
          )}
        </div>

        {/* Input Area - Full Width */}
        {!showLanding && (
          <div className={`border-t p-6 ${
            theme === 'light'
              ? 'border-gray-200 bg-transparent'
              : 'border-white/10 bg-transparent'
          }`}>
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  category="chat"
                />
              </div>
              {/* Hide chat input on mobile when landing view is active (it has its own input) */}
              <div className={showLanding ? 'hidden md:block' : ''}>
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => handleSendMessage()}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask KroniQ anything..."
                  disabled={isLoading}
                  selectedModel={selectedModel}
                />
              </div>
            </div>
          </div>
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
          selectedModel={selectedModel}
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

      {showMusicGenerator && (
        <MusicGenerator
          onClose={() => {
            setShowMusicGenerator(false);
            setMusicPrompt('');
          }}
          initialPrompt={musicPrompt}
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
    </div>
  );
};
