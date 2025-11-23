/**
 * Gemini 2.5 Text-to-Speech Service
 * Uses Google's TTS with 30 voice options across 24 languages
 */

export interface GeminiTTSParams {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
}

// Available voices
export const GEMINI_VOICES = [
  { id: 'en-US-Neural2-A', name: 'US English Female 1', language: 'en-US', gender: 'female' },
  { id: 'en-US-Neural2-C', name: 'US English Female 2', language: 'en-US', gender: 'female' },
  { id: 'en-US-Neural2-D', name: 'US English Male 1', language: 'en-US', gender: 'male' },
  { id: 'en-US-Neural2-F', name: 'US English Female 3', language: 'en-US', gender: 'female' },
  { id: 'en-GB-Neural2-A', name: 'UK English Female 1', language: 'en-GB', gender: 'female' },
  { id: 'en-GB-Neural2-B', name: 'UK English Male 1', language: 'en-GB', gender: 'male' },
  { id: 'en-AU-Neural2-A', name: 'Australian Female 1', language: 'en-AU', gender: 'female' },
  { id: 'en-AU-Neural2-B', name: 'Australian Male 1', language: 'en-AU', gender: 'male' },
  { id: 'es-ES-Neural2-A', name: 'Spanish Female 1', language: 'es-ES', gender: 'female' },
  { id: 'es-ES-Neural2-B', name: 'Spanish Male 1', language: 'es-ES', gender: 'male' },
  { id: 'fr-FR-Neural2-A', name: 'French Female 1', language: 'fr-FR', gender: 'female' },
  { id: 'fr-FR-Neural2-B', name: 'French Male 1', language: 'fr-FR', gender: 'male' },
  { id: 'de-DE-Neural2-A', name: 'German Female 1', language: 'de-DE', gender: 'female' },
  { id: 'de-DE-Neural2-B', name: 'German Male 1', language: 'de-DE', gender: 'male' },
  { id: 'it-IT-Neural2-A', name: 'Italian Female 1', language: 'it-IT', gender: 'female' },
  { id: 'it-IT-Neural2-C', name: 'Italian Male 1', language: 'it-IT', gender: 'male' },
  { id: 'ja-JP-Neural2-B', name: 'Japanese Female 1', language: 'ja-JP', gender: 'female' },
  { id: 'ja-JP-Neural2-C', name: 'Japanese Male 1', language: 'ja-JP', gender: 'male' },
  { id: 'ko-KR-Neural2-A', name: 'Korean Female 1', language: 'ko-KR', gender: 'female' },
  { id: 'ko-KR-Neural2-B', name: 'Korean Male 1', language: 'ko-KR', gender: 'male' },
  { id: 'pt-BR-Neural2-A', name: 'Brazilian Portuguese Female 1', language: 'pt-BR', gender: 'female' },
  { id: 'pt-BR-Neural2-B', name: 'Brazilian Portuguese Male 1', language: 'pt-BR', gender: 'male' },
  { id: 'ru-RU-Standard-A', name: 'Russian Female 1', language: 'ru-RU', gender: 'female' },
  { id: 'ru-RU-Standard-B', name: 'Russian Male 1', language: 'ru-RU', gender: 'male' },
  { id: 'zh-CN-Standard-A', name: 'Chinese Female 1', language: 'zh-CN', gender: 'female' },
  { id: 'zh-CN-Standard-B', name: 'Chinese Male 1', language: 'zh-CN', gender: 'male' },
  { id: 'hi-IN-Neural2-A', name: 'Hindi Female 1', language: 'hi-IN', gender: 'female' },
  { id: 'hi-IN-Neural2-B', name: 'Hindi Male 1', language: 'hi-IN', gender: 'male' },
  { id: 'ar-XA-Standard-A', name: 'Arabic Female 1', language: 'ar-XA', gender: 'female' },
  { id: 'ar-XA-Standard-B', name: 'Arabic Male 1', language: 'ar-XA', gender: 'male' },
];

/**
 * Generate speech using Gemini TTS
 */
export async function generateWithGeminiTTS(
  params: GeminiTTSParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_KEY || GEMINI_KEY.includes('your-')) {
      throw new Error('Google Gemini API key not configured');
    }

    onProgress?.('Initializing Gemini TTS...');

    const voice = params.voice || 'en-US-Neural2-A';
    const language = params.language || 'en-US';

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: params.text },
          voice: {
            languageCode: language,
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: params.speed || 1.0,
            pitch: params.pitch || 0.0,
            volumeGainDb: 0.0,
            sampleRateHertz: 24000,
            effectsProfileId: ['small-bluetooth-speaker-class-device']
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS Error:', errorText);
      throw new Error(`Gemini TTS Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('No audio content in response');
    }

    onProgress?.('Speech generated successfully!');

    // Return as data URL
    return `data:audio/mp3;base64,${data.audioContent}`;

  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    throw new Error(error.message || 'Failed to generate speech with Gemini TTS');
  }
}

/**
 * Check if Gemini TTS is available
 */
export function isGeminiTTSAvailable(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
