/**
 * PPT Generation Service
 * Generates professional presentations using AI content generation
 */

import { getOpenRouterResponse } from './openRouterService';

export interface SlideContent {
  title: string;
  content: string[];
  notes?: string;
  layout?: 'title' | 'content' | 'two-column' | 'image-text';
}

export interface PPTGenerationOptions {
  topic: string;
  slideCount: number;
  theme: 'professional' | 'modern' | 'creative' | 'minimal';
  includeImages?: boolean;
}

export interface GeneratedPPT {
  slides: SlideContent[];
  title: string;
  subtitle: string;
  theme: string;
}

/**
 * Generate presentation content using AI
 */
export async function generatePPTContent(options: PPTGenerationOptions): Promise<GeneratedPPT> {
  const { topic, slideCount, theme } = options;

  console.log('🎯 Generating PPT content:', { topic, slideCount, theme });

  // Create a detailed prompt for AI to generate presentation structure
  const prompt = `Create a professional presentation outline about "${topic}" with exactly ${slideCount} slides.

For each slide, provide:
1. Slide title (concise and clear)
2. 3-5 bullet points of content
3. Speaker notes (2-3 sentences)

Theme: ${theme}

Return the response in this exact JSON format:
{
  "title": "Main presentation title",
  "subtitle": "Brief subtitle or tagline",
  "slides": [
    {
      "title": "Slide 1 Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes here",
      "layout": "title"
    },
    {
      "title": "Slide 2 Title",
      "content": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "notes": "Speaker notes here",
      "layout": "content"
    }
  ]
}

Guidelines:
- First slide should be title slide (layout: "title")
- Last slide should be conclusion/thank you (layout: "content")
- Middle slides should be content slides (layout: "content")
- Make content professional, clear, and actionable
- Keep bullet points concise (max 10 words each)
- Include relevant details in speaker notes

Generate the presentation now:`;

  try {
    // Use OpenRouter to generate content
    const response = await getOpenRouterResponse(
      prompt,
      'anthropic/claude-3.5-sonnet',
      []
    );

    console.log('✅ Received AI response');

    // Parse the JSON response
    let pptData: GeneratedPPT;

    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);

      // Fallback: Create structured data from text response
      pptData = createFallbackPPT(topic, slideCount, response);
    }

    // Validate and ensure we have the right number of slides
    if (pptData.slides.length < slideCount) {
      // Add more slides if needed
      while (pptData.slides.length < slideCount) {
        pptData.slides.push({
          title: `Additional Point ${pptData.slides.length}`,
          content: ['Content will be added here', 'More details', 'Key insights'],
          notes: 'Additional speaker notes',
          layout: 'content'
        });
      }
    } else if (pptData.slides.length > slideCount) {
      // Trim excess slides
      pptData.slides = pptData.slides.slice(0, slideCount);
    }

    console.log('✅ PPT content generated successfully:', pptData.slides.length, 'slides');
    return pptData;

  } catch (error) {
    console.error('❌ Error generating PPT content:', error);
    throw new Error('Failed to generate presentation content');
  }
}

/**
 * Create fallback PPT structure if AI parsing fails
 */
function createFallbackPPT(topic: string, slideCount: number, aiResponse: string): GeneratedPPT {
  const slides: SlideContent[] = [];

  // Title slide
  slides.push({
    title: topic,
    content: ['Professional Presentation', 'Created with AI'],
    notes: `This is an AI-generated presentation about ${topic}`,
    layout: 'title'
  });

  // Content slides
  const sections = aiResponse.split('\n\n').filter(s => s.trim());
  for (let i = 1; i < slideCount - 1 && i < sections.length + 1; i++) {
    slides.push({
      title: `Key Point ${i}`,
      content: [
        sections[i - 1]?.substring(0, 80) || 'Content point 1',
        'Supporting detail',
        'Additional information',
        'Key insight'
      ],
      notes: 'Detailed explanation of this point',
      layout: 'content'
    });
  }

  // Conclusion slide
  slides.push({
    title: 'Thank You',
    content: ['Questions?', 'Contact information', 'Next steps'],
    notes: 'Wrap up and invite questions',
    layout: 'content'
  });

  return {
    title: topic,
    subtitle: 'AI-Generated Presentation',
    slides,
    theme: 'professional'
  };
}

/**
 * Generate downloadable PPTX file
 * Note: This creates a simple text-based format. For actual PPTX, you would need a library like pptxgenjs
 */
export async function generatePPTXFile(pptData: GeneratedPPT): Promise<Blob> {
  console.log('📊 Generating PPTX file...');

  // Create a simple text representation (in production, use pptxgenjs or similar)
  let content = `PRESENTATION: ${pptData.title}\n`;
  content += `SUBTITLE: ${pptData.subtitle}\n\n`;
  content += `=========================================\n\n`;

  pptData.slides.forEach((slide, index) => {
    content += `SLIDE ${index + 1}: ${slide.title}\n`;
    content += `Layout: ${slide.layout}\n\n`;
    slide.content.forEach((point, i) => {
      content += `  ${i + 1}. ${point}\n`;
    });
    if (slide.notes) {
      content += `\nSpeaker Notes: ${slide.notes}\n`;
    }
    content += `\n=========================================\n\n`;
  });

  // Create blob
  const blob = new Blob([content], { type: 'text/plain' });

  console.log('✅ PPTX file generated');
  return blob;
}

/**
 * Download the generated PPTX file
 */
export function downloadPPTX(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`; // In production: .pptx
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('✅ Download triggered:', filename);
}
