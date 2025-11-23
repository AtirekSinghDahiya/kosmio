/**
 * Gemini 2.5 Flash Image Generation (Nano Banana)
 * Uses Gemini's built-in image generation capabilities
 */

export interface NanoBananaParams {
  prompt: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  numberOfImages?: number;
}

/**
 * Generate images using Gemini 2.5 Flash with Nano Banana
 */
export async function generateWithNanoBanana(
  params: NanoBananaParams,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    const NANO_BANANA_KEY = import.meta.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

    if (!NANO_BANANA_KEY || NANO_BANANA_KEY.includes('your-')) {
      throw new Error('Nano Banana API key not configured');
    }

    onProgress?.('Initializing Gemini Nano Banana...');

    // Map aspect ratios
    const aspectRatioMap: Record<string, string> = {
      'square': '1:1',
      'landscape': '16:9',
      'portrait': '9:16'
    };

    const aspectRatio = aspectRatioMap[params.aspectRatio || 'square'];

    // Call Gemini API with image generation request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent?key=${NANO_BANANA_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${params.prompt}\n\nAspect Ratio: ${aspectRatio}\nStyle: High quality, detailed, professional`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nano Banana API Error:', errorText);
      throw new Error(`Nano Banana API Error: ${response.status}`);
    }

    const data = await response.json();

    // Extract image data from response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No image generated');
    }

    const candidate = data.candidates[0];

    // Check for inline data (image)
    if (candidate.content?.parts?.[0]?.inlineData) {
      const imageData = candidate.content.parts[0].inlineData;
      onProgress?.('Image generated successfully!');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    }

    // If no inline data, try to extract from text response
    const text = candidate.content?.parts?.[0]?.text;
    if (text && text.includes('base64')) {
      onProgress?.('Image generated successfully!');
      return text;
    }

    throw new Error('No image data in response');

  } catch (error: any) {
    console.error('Nano Banana generation error:', error);
    throw new Error(error.message || 'Failed to generate image with Nano Banana');
  }
}

/**
 * Check if Nano Banana is available
 */
export function isNanoBananaAvailable(): boolean {
  const key = import.meta.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && !key.includes('your-');
}
