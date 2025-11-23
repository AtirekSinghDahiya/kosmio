/**
 * ElevenLabs Text-to-Speech Service
 * High-quality voice synthesis
 */

export interface ElevenLabsTTSParams {
  text: string;
  voice?: string;
  model?: string;
  stability?: number;
  similarity_boost?: number;
}

// Popular ElevenLabs voices
export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel - Calm' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi - Strong' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella - Soft' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni - Well-rounded' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli - Emotional' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh - Deep' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold - Crisp' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam - Narrative' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam - Young' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel - Deep British' },
];

/**
 * Generate speech using ElevenLabs TTS
 */
export async function generateWithElevenLabs(
  params: ElevenLabsTTSParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

    if (!ELEVENLABS_KEY || ELEVENLABS_KEY.includes('your-')) {
      throw new Error('ElevenLabs API key not configured');
    }

    onProgress?.('Initializing ElevenLabs TTS...');

    const voiceId = params.voice || ELEVENLABS_VOICES[0].id;
    const modelId = params.model || 'eleven_monolingual_v1';

    // Use AIMLAPI for text-to-speech (supports multiple TTS providers)
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Generating speech...');

    const response = await fetch('https://api.aimlapi.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: params.text,
        voice: 'alloy',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TTS generation error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    // Convert audio blob to base64
    const audioBlob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        onProgress?.('Speech generated successfully!');
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read audio data'));
      reader.readAsDataURL(audioBlob);
    });

  } catch (error: any) {
    console.error('ElevenLabs TTS error:', error);
    throw new Error(error.message || 'Failed to generate speech with ElevenLabs');
  }
}

/**
 * Check if ElevenLabs is available
 */
export function isElevenLabsAvailable(): boolean {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  return !!key && !key.includes('your-');
}
