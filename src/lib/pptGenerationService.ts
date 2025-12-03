import { getOpenRouterResponse } from './openRouterService';
import PptxGenJS from 'pptxgenjs';

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

export async function generatePPTContent(options: PPTGenerationOptions): Promise<GeneratedPPT> {
  const { topic, slideCount, theme } = options;

  console.log('🎯 Generating PPT content:', { topic, slideCount, theme });

  const prompt = `Create a professional presentation outline about "${topic}" with exactly ${slideCount} slides.

For each slide, provide:
1. Slide title (concise and clear)
2. 3-5 bullet points of content (each max 10 words)
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
- Keep bullet points concise
- Include relevant details in speaker notes`;

  try {
    const response = await getOpenRouterResponse(
      prompt,
      'anthropic/claude-3.5-sonnet',
      []
    );

    console.log('✅ Received AI response');

    let pptData: GeneratedPPT;

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      pptData = createFallbackPPT(topic, slideCount, response);
    }

    if (pptData.slides.length < slideCount) {
      while (pptData.slides.length < slideCount) {
        pptData.slides.push({
          title: `Additional Point ${pptData.slides.length}`,
          content: ['Content will be added here', 'More details', 'Key insights'],
          notes: 'Additional speaker notes',
          layout: 'content'
        });
      }
    } else if (pptData.slides.length > slideCount) {
      pptData.slides = pptData.slides.slice(0, slideCount);
    }

    console.log('✅ PPT content generated successfully:', pptData.slides.length, 'slides');
    return pptData;

  } catch (error) {
    console.error('❌ Error generating PPT content:', error);
    throw new Error('Failed to generate presentation content');
  }
}

function createFallbackPPT(topic: string, slideCount: number, aiResponse: string): GeneratedPPT {
  const slides: SlideContent[] = [];

  slides.push({
    title: topic,
    content: ['Professional Presentation', 'Created with AI'],
    notes: `This is an AI-generated presentation about ${topic}`,
    layout: 'title'
  });

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

export async function generatePPTXFile(pptData: GeneratedPPT): Promise<Blob> {
  console.log('📊 Generating professional PPTX file...');

  const pres = new PptxGenJS();

  pres.author = 'KroniQ AI';
  pres.company = 'KroniQ';
  pres.subject = pptData.title;
  pres.title = pptData.title;

  pres.layout = 'LAYOUT_WIDE';

  const themeColors = {
    professional: { primary: '1E40AF', secondary: '3B82F6', text: '1F2937' },
    modern: { primary: '7C3AED', secondary: 'A78BFA', text: '1F2937' },
    creative: { primary: 'DC2626', secondary: 'F97316', text: '1F2937' },
    minimal: { primary: '374151', secondary: '6B7280', text: '1F2937' }
  };

  const theme = themeColors[pptData.theme as keyof typeof themeColors] || themeColors.professional;

  pptData.slides.forEach((slideData, index) => {
    const slide = pres.addSlide();

    if (slideData.layout === 'title') {
      slide.background = { color: 'FFFFFF' };

      slide.addText(slideData.title, {
        x: 0.5,
        y: '40%',
        w: '90%',
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: theme.primary,
        align: 'center',
        valign: 'middle'
      });

      if (pptData.subtitle) {
        slide.addText(pptData.subtitle, {
          x: 0.5,
          y: '55%',
          w: '90%',
          h: 0.6,
          fontSize: 24,
          color: theme.secondary,
          align: 'center',
          valign: 'middle'
        });
      }

      slide.addShape(pres.ShapeType.rect, {
        x: 1,
        y: 6.8,
        w: 8,
        h: 0.05,
        fill: { color: theme.primary }
      });

    } else {
      slide.background = { color: 'FFFFFF' };

      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.8,
        fill: { color: theme.primary }
      });

      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.15,
        w: '90%',
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: 'FFFFFF',
        align: 'left',
        valign: 'middle'
      });

      slide.addText(slideData.content.map((point, i) => ({
        text: point,
        options: {
          bullet: { type: 'number', numberStartAt: i + 1 },
          breakLine: true
        }
      })), {
        x: 0.7,
        y: 1.5,
        w: 8.6,
        h: 4.5,
        fontSize: 20,
        color: theme.text,
        valign: 'top'
      });

      slide.addText(`${index + 1} / ${pptData.slides.length}`, {
        x: 9.2,
        y: 6.9,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: theme.secondary,
        align: 'right'
      });
    }

    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  });

  const blob = await pres.write({ outputType: 'blob' }) as Blob;

  console.log('✅ Professional PPTX file generated');
  return blob;
}

export function downloadPPTX(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pptx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log('✅ Download triggered:', filename);
}
