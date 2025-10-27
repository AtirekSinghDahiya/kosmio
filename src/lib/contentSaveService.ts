/**
 * Content Save Service
 * Saves all types of generated content (images, videos, music, etc.) to projects
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { createProject, addMessageToProject } from './projectService';

export type ContentType = 'image' | 'video' | 'music' | 'voiceover' | 'ppt' | 'code' | 'design';

export interface SavedContent {
  id: string;
  projectId: string;
  type: ContentType;
  prompt: string;
  url?: string;
  data?: any;
  metadata?: {
    model?: string;
    duration?: number;
    dimensions?: string;
    fileSize?: string;
    provider?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

/**
 * Save generated image to project
 */
export async function saveImageToProject(
  userId: string,
  prompt: string,
  imageUrl: string,
  metadata?: {
    model?: string;
    dimensions?: string;
    provider?: string;
  }
): Promise<string> {
  try {
    console.log('💾 Saving image to project...');

    // Create or find project
    const projectId = await createProject(userId, `Image: ${prompt.substring(0, 50)}`, 'gemini');

    // Add the prompt as a user message
    await addMessageToProject(projectId, 'user', prompt);

    // Add the image as an assistant response
    const imageMessage = `I've generated your image!\n\n![Generated Image](${imageUrl})\n\n**Prompt:** ${prompt}`;
    await addMessageToProject(projectId, 'assistant', imageMessage);

    // Save to content collection for easy retrieval
    const contentData = {
      userId,
      projectId,
      type: 'image',
      prompt,
      url: imageUrl,
      metadata: {
        model: metadata?.model || 'flux-schnell',
        dimensions: metadata?.dimensions || 'unknown',
        provider: metadata?.provider || 'replicate',
        generatedAt: Timestamp.now()
      },
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'generated_content'), contentData);

    console.log('✅ Image saved to project:', projectId);
    return projectId;
  } catch (error) {
    console.error('❌ Error saving image to project:', error);
    throw error;
  }
}

/**
 * Save generated video to project
 */
export async function saveVideoToProject(
  userId: string,
  prompt: string,
  videoUrl: string,
  metadata?: {
    model?: string;
    duration?: number;
    provider?: string;
  }
): Promise<string> {
  try {
    console.log('💾 Saving video to project...');

    // Create or find project
    const projectId = await createProject(userId, `Video: ${prompt.substring(0, 50)}`, 'gemini');

    // Add the prompt as a user message
    await addMessageToProject(projectId, 'user', prompt);

    // Add the video as an assistant response
    const videoMessage = `I've generated your video!\n\n🎬 **Video Ready**\n\n[Download Video](${videoUrl})\n\n**Prompt:** ${prompt}\n**Duration:** ${metadata?.duration || 5}s`;
    await addMessageToProject(projectId, 'assistant', videoMessage);

    // Save to content collection
    const contentData = {
      userId,
      projectId,
      type: 'video',
      prompt,
      url: videoUrl,
      metadata: {
        model: metadata?.model || 'unknown',
        duration: metadata?.duration || 5,
        provider: metadata?.provider || 'unknown',
        generatedAt: Timestamp.now()
      },
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'generated_content'), contentData);

    console.log('✅ Video saved to project:', projectId);
    return projectId;
  } catch (error) {
    console.error('❌ Error saving video to project:', error);
    throw error;
  }
}

/**
 * Save generated music to project
 */
export async function saveMusicToProject(
  userId: string,
  prompt: string,
  audioUrl: string,
  metadata?: {
    model?: string;
    duration?: number;
    title?: string;
  }
): Promise<string> {
  try {
    console.log('💾 Saving music to project...');

    // Create or find project
    const projectId = await createProject(userId, `Music: ${prompt.substring(0, 50)}`, 'gemini');

    // Add the prompt as a user message
    await addMessageToProject(projectId, 'user', prompt);

    // Add the music as an assistant response
    const musicMessage = `I've generated your music!\n\n🎵 **${metadata?.title || 'Music Track'}**\n\n[Listen Now](${audioUrl})\n\n**Prompt:** ${prompt}`;
    await addMessageToProject(projectId, 'assistant', musicMessage);

    // Save to content collection
    const contentData = {
      userId,
      projectId,
      type: 'music',
      prompt,
      url: audioUrl,
      metadata: {
        model: metadata?.model || 'suno',
        duration: metadata?.duration || 30,
        title: metadata?.title || 'Untitled',
        generatedAt: Timestamp.now()
      },
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'generated_content'), contentData);

    console.log('✅ Music saved to project:', projectId);
    return projectId;
  } catch (error) {
    console.error('❌ Error saving music to project:', error);
    throw error;
  }
}

/**
 * Save generated voiceover to project
 */
export async function saveVoiceoverToProject(
  userId: string,
  text: string,
  audioUrl: string,
  metadata?: {
    voice?: string;
    duration?: number;
  }
): Promise<string> {
  try {
    console.log('💾 Saving voiceover to project...');

    // Create or find project
    const projectId = await createProject(userId, `Voiceover: ${text.substring(0, 50)}`, 'gemini');

    // Add the text as a user message
    await addMessageToProject(projectId, 'user', `Generate voiceover: ${text}`);

    // Add the voiceover as an assistant response
    const voiceMessage = `I've generated your voiceover!\n\n🎙️ **Voiceover Ready**\n\n[Listen Now](${audioUrl})\n\n**Text:** ${text}`;
    await addMessageToProject(projectId, 'assistant', voiceMessage);

    // Save to content collection
    const contentData = {
      userId,
      projectId,
      type: 'voiceover',
      prompt: text,
      url: audioUrl,
      metadata: {
        voice: metadata?.voice || 'default',
        duration: metadata?.duration || 0,
        generatedAt: Timestamp.now()
      },
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'generated_content'), contentData);

    console.log('✅ Voiceover saved to project:', projectId);
    return projectId;
  } catch (error) {
    console.error('❌ Error saving voiceover to project:', error);
    throw error;
  }
}

/**
 * Save generated PPT to project
 */
export async function savePPTToProject(
  userId: string,
  prompt: string,
  pptData: any,
  metadata?: {
    slideCount?: number;
    theme?: string;
  }
): Promise<string> {
  try {
    console.log('💾 Saving PPT to project...');

    // Create or find project
    const projectId = await createProject(userId, `Presentation: ${prompt.substring(0, 50)}`, 'gemini');

    // Add the prompt as a user message
    await addMessageToProject(projectId, 'user', prompt);

    // Add the PPT as an assistant response
    const pptMessage = `I've generated your presentation!\n\n📊 **Presentation Ready**\n\n**Slides:** ${metadata?.slideCount || 0}\n**Theme:** ${metadata?.theme || 'Default'}\n\n**Prompt:** ${prompt}`;
    await addMessageToProject(projectId, 'assistant', pptMessage);

    // Save to content collection
    const contentData = {
      userId,
      projectId,
      type: 'ppt',
      prompt,
      data: pptData,
      metadata: {
        slideCount: metadata?.slideCount || 0,
        theme: metadata?.theme || 'default',
        generatedAt: Timestamp.now()
      },
      createdAt: Timestamp.now()
    };

    await addDoc(collection(db, 'generated_content'), contentData);

    console.log('✅ PPT saved to project:', projectId);
    return projectId;
  } catch (error) {
    console.error('❌ Error saving PPT to project:', error);
    throw error;
  }
}

/**
 * Get all generated content for a user
 */
export async function getUserContent(userId: string, type?: ContentType): Promise<SavedContent[]> {
  try {
    // This would use Firestore queries in production
    // For now, returning empty array as placeholder
    return [];
  } catch (error) {
    console.error('❌ Error fetching user content:', error);
    return [];
  }
}
