/**
 * ElevenLabs Text-to-Speech Service
 * Uses AIMLAPI with OpenAI TTS model
 * Documentation: https://docs.aimlapi.com/api-references/speech-models/text-to-speech
 */

export interface ElevenLabsTTSParams {
  text: string;
  voice?: string;
  model?: string;
  stability?: number;
  similarity_boost?: number;
}

// Popular voice options
export const ELEVENLABS_VOICES = [
  { id: 'alloy', name: 'Alloy - Neutral' },
  { id: 'echo', name: 'Echo - Male' },
  { id: 'fable', name: 'Fable - British' },
  { id: 'onyx', name: 'Onyx - Deep' },
  { id: 'nova', name: 'Nova - Female' },
  { id: 'shimmer', name: 'Shimmer - Soft Female' },
];

/**
 * Generate speech using AIMLAPI TTS
 */
export async function generateWithElevenLabs(
  params: ElevenLabsTTSParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const AIML_KEY = import.meta.env.VITE_AIMLAPI_KEY;

    if (!AIML_KEY) {
      throw new Error('AIMLAPI key not configured');
    }

    onProgress?.('Initializing text-to-speech...');

    const voice = params.voice || 'alloy';

    onProgress?.('Generating speech...');

    const response = await fetch('https://api.aimlapi.com/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/tts-1',
        text: params.text,
        voice: voice,
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TTS generation error:', response.status, errorData);
      throw new Error(`TTS generation error: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
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
  const key = import.meta.env.VITE_AIMLAPI_KEY;
  return !!key;
}
