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
      console.log('Using fallback PPT generation');
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
    console.log('⚠️ Using emergency fallback for PPT');
    // Return fallback instead of throwing
    return createFallbackPPT(topic, slideCount, '');
  }
}

function createFallbackPPT(topic: string, slideCount: number, aiResponse: string): GeneratedPPT {
  const slides: SlideContent[] = [];

  // Title slide
  slides.push({
    title: topic,
    content: ['Professional Presentation', 'Created with AI'],
    notes: `This is an AI-generated presentation about ${topic}`,
    layout: 'title'
  });

  // Generate content slides to match requested count
  const contentSlideCount = slideCount - 2; // -2 for title and conclusion
  const sections = [
    'Introduction & Overview',
    'Key Concepts',
    'Benefits & Advantages',
    'Implementation Strategy',
    'Technical Details',
    'Market Analysis',
    'Competitive Landscape',
    'Use Cases & Applications',
    'Success Metrics',
    'Best Practices',
    'Challenges & Solutions',
    'Future Roadmap',
    'Investment & ROI'
  ];

  for (let i = 0; i < contentSlideCount; i++) {
    const sectionTitle = sections[i % sections.length];
    slides.push({
      title: `${sectionTitle}`,
      content: [
        `Key point about ${topic.toLowerCase()}`,
        `Important consideration for success`,
        `Strategic implementation approach`,
        `Measurable outcomes and impact`,
        `Next steps and action items`
      ],
      notes: `Detailed explanation of ${sectionTitle.toLowerCase()} related to ${topic}`,
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

export async function generatePPTXFile(pptData: GeneratedPPT): Promise<Blob> {
  console.log('📊 Generating professional PPTX file...');

  const pres = new PptxGenJS();

  pres.author = 'KroniQ AI';
  pres.company = 'KroniQ';
  pres.subject = pptData.title;
  pres.title = pptData.title;

  pres.layout = 'LAYOUT_WIDE';

  const themeConfigs = {
    professional: {
      primary: '1E3A8A',
      secondary: '3B82F6',
      accent: '60A5FA',
      text: '1F2937',
      light: 'E0F2FE',
      gradient: ['1E3A8A', '3B82F6']
    },
    modern: {
      primary: '6366F1',
      secondary: '8B5CF6',
      accent: 'A78BFA',
      text: '1F2937',
      light: 'EDE9FE',
      gradient: ['6366F1', 'A78BFA']
    },
    creative: {
      primary: 'DC2626',
      secondary: 'F59E0B',
      accent: 'FBBF24',
      text: '1F2937',
      light: 'FEF3C7',
      gradient: ['DC2626', 'F59E0B']
    },
    minimal: {
      primary: '111827',
      secondary: '374151',
      accent: '6B7280',
      text: '1F2937',
      light: 'F3F4F6',
      gradient: ['111827', '374151']
    }
  };

  const theme = themeConfigs[pptData.theme as keyof typeof themeConfigs] || themeConfigs.professional;

  pptData.slides.forEach((slideData, index) => {
    const slide = pres.addSlide();

    if (slideData.layout === 'title') {
      // Title slide with gradient background
      slide.background = { fill: theme.gradient[0] };

      // Add decorative shapes
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
        fill: { type: 'solid', color: theme.gradient[0] }
      });

      slide.addShape(pres.ShapeType.rect, {
        x: '70%',
        y: 0,
        w: '30%',
        h: '100%',
        fill: { type: 'solid', color: theme.gradient[1], transparency: 30 },
        rotate: 15
      });

      // Large decorative circle
      slide.addShape(pres.ShapeType.ellipse, {
        x: 7.5,
        y: 4.5,
        w: 3.5,
        h: 3.5,
        fill: { color: theme.accent, transparency: 20 }
      });

      // Main title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 2.5,
        w: 7,
        h: 1.5,
        fontSize: 54,
        bold: true,
        color: 'FFFFFF',
        align: 'left',
        valign: 'middle',
        shadow: { type: 'outer', blur: 10, opacity: 0.3, angle: 45 }
      });

      // Subtitle
      if (pptData.subtitle) {
        slide.addText(pptData.subtitle, {
          x: 0.8,
          y: 4.2,
          w: 6,
          h: 0.8,
          fontSize: 24,
          color: theme.light,
          align: 'left',
          valign: 'middle'
        });
      }

      // Decorative accent line
      slide.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 4.0,
        w: 2.5,
        h: 0.08,
        fill: { color: theme.accent }
      });

    } else {
      // Content slides with modern design
      slide.background = { color: 'F9FAFB' };

      // Header with gradient
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 1.2,
        fill: { color: theme.primary }
      });

      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.15,
        h: 1.2,
        fill: { color: theme.accent }
      });

      // Title text
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.25,
        w: 8.5,
        h: 0.7,
        fontSize: 36,
        bold: true,
        color: 'FFFFFF',
        align: 'left',
        valign: 'middle'
      });

      // Decorative side element
      slide.addShape(pres.ShapeType.ellipse, {
        x: -0.5,
        y: 2,
        w: 1.5,
        h: 1.5,
        fill: { color: theme.accent, transparency: 80 }
      });

      // Content area with shadow
      slide.addShape(pres.ShapeType.rect, {
        x: 0.6,
        y: 1.8,
        w: 8.8,
        h: 4.4,
        fill: { color: 'FFFFFF' },
        line: { color: theme.light, width: 1 },
        shadow: { type: 'outer', blur: 15, opacity: 0.1, offset: 3, angle: 90 }
      });

      // Bullet points
      slide.addText(slideData.content.map((point, i) => ({
        text: `${point}`,
        options: {
          bullet: { code: '2022', color: theme.accent },
          breakLine: true,
          lineSpacing: 24
        }
      })), {
        x: 1.2,
        y: 2.3,
        w: 7.6,
        h: 3.4,
        fontSize: 18,
        color: theme.text,
        valign: 'top'
      });

      // Footer with page number
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 6.8,
        w: '100%',
        h: 0.7,
        fill: { color: theme.light }
      });

      slide.addText(`${index + 1}`, {
        x: 9,
        y: 6.85,
        w: 0.8,
        h: 0.6,
        fontSize: 16,
        bold: true,
        color: theme.primary,
        align: 'center',
        valign: 'middle'
      });

      // Decorative corner element
      slide.addShape(pres.ShapeType.ellipse, {
        x: 9.2,
        y: -0.3,
        w: 1.2,
        h: 1.2,
        fill: { color: theme.secondary, transparency: 70 }
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
