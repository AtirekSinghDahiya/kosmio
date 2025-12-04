const KIE_API_KEY = 'c2fc73165de059fdcd158e418571b3d2';
const KIE_BASE_URL = 'https://api.kie.ai/v1';

interface KieImageRequest {
  model: string;
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
}

interface KieVideoRequest {
  model: string;
  prompt: string;
  duration?: number;
  resolution?: string;
}

interface KieMusicRequest {
  model: string;
  prompt: string;
  duration?: number;
  style?: string;
}

export async function generateKieImage(prompt: string, model: string = 'flux-pro'): Promise<string> {
  console.log('🎨 Generating image with Kie AI:', { prompt, model });

  try {
    const response = await fetch(`${KIE_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        width: 1024,
        height: 1024,
        steps: 30,
        guidance_scale: 7.5
      } as KieImageRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kie AI image generation failed:', response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Image generated successfully');

    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    } else if (data.url) {
      return data.url;
    } else if (data.image_url) {
      return data.image_url;
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error('❌ Kie AI image generation error:', error);
    throw error;
  }
}

export async function generateKieVideo(prompt: string, model: string = 'kling-video'): Promise<string> {
  console.log('🎬 Generating video with Kie AI:', { prompt, model });

  try {
    const response = await fetch(`${KIE_BASE_URL}/videos/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        duration: 5,
        resolution: '1280x720'
      } as KieVideoRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kie AI video generation failed:', response.status, errorText);
      throw new Error(`Video generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Video generation initiated');

    if (data.id) {
      return await pollKieVideoStatus(data.id);
    } else if (data.video_url) {
      return data.video_url;
    } else if (data.url) {
      return data.url;
    } else {
      throw new Error('No video ID or URL in response');
    }
  } catch (error) {
    console.error('❌ Kie AI video generation error:', error);
    throw error;
  }
}

async function pollKieVideoStatus(videoId: string, maxAttempts: number = 60): Promise<string> {
  console.log('⏳ Polling video status:', videoId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${KIE_BASE_URL}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed' || data.status === 'succeeded') {
        console.log('✅ Video generation completed');
        return data.video_url || data.url || data.output;
      } else if (data.status === 'failed' || data.status === 'error') {
        throw new Error('Video generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error polling video status:', error);
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  throw new Error('Video generation timeout');
}

export async function generateKieMusic(prompt: string, duration: number = 30): Promise<string> {
  console.log('🎵 Generating music with Kie AI (Suno):', { prompt, duration });

  try {
    const response = await fetch(`${KIE_BASE_URL}/audio/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'suno-v3.5',
        prompt: prompt,
        duration: duration,
        make_instrumental: false,
        wait_audio: false
      } as KieMusicRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kie AI music generation failed:', response.status, errorText);
      throw new Error(`Music generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Music generation initiated');

    if (data.id) {
      return await pollKieMusicStatus(data.id);
    } else if (data.audio_url) {
      return data.audio_url;
    } else if (data.url) {
      return data.url;
    } else {
      throw new Error('No music ID or URL in response');
    }
  } catch (error) {
    console.error('❌ Kie AI music generation error:', error);
    throw error;
  }
}

async function pollKieMusicStatus(musicId: string, maxAttempts: number = 60): Promise<string> {
  console.log('⏳ Polling music status:', musicId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${KIE_BASE_URL}/audio/${musicId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check music status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed' || data.status === 'succeeded') {
        console.log('✅ Music generation completed');
        return data.audio_url || data.url || data.output;
      } else if (data.status === 'failed' || data.status === 'error') {
        throw new Error('Music generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error polling music status:', error);
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  throw new Error('Music generation timeout');
}

export const KIE_MODELS = {
  image: [
    { id: 'flux-pro', name: 'Flux Pro', description: 'High-quality image generation' },
    { id: 'flux-dev', name: 'Flux Dev', description: 'Fast development model' },
    { id: 'sdxl', name: 'Stable Diffusion XL', description: 'Popular open-source model' },
    { id: 'dalle-3', name: 'DALL-E 3', description: 'OpenAI image model' }
  ],
  video: [
    { id: 'kling-video', name: 'Kling Video', description: 'High-quality video generation' },
    { id: 'runway-gen3', name: 'Runway Gen-3', description: 'Professional video generation' },
    { id: 'luma-dream-machine', name: 'Luma Dream Machine', description: 'Cinematic video generation' }
  ],
  music: [
    { id: 'suno-v3.5', name: 'Suno v3.5', description: 'Latest Suno music model' },
    { id: 'suno-v3', name: 'Suno v3', description: 'Stable music generation' }
  ]
};
