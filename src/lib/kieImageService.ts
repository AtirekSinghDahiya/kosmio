/**
 * Kie AI Image Generation Service
 * Supports: Nano Banana, Seedreem, GPT-4o Image
 */

const KIE_API_KEY = '8241daa7e6b6271fc75b5a2ecc85e428';
const KIE_API_BASE = 'https://api.kie.art';

export type ImageModel = 'nano-banana' | 'seedreem' | 'gpt-4o-image';

export interface ImageGenerateParams {
  model: ImageModel;
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  negative_prompt?: string;
  seed?: number;
  num_outputs?: number;
}

export interface ImageTaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_urls?: string[];
  error?: string;
}

/**
 * Create image generation task
 */
export async function createImageTask(params: ImageGenerateParams): Promise<ImageTaskResponse> {
  const endpoint = getEndpointForModel(params.model);

  const requestBody: any = {
    prompt: params.prompt,
    width: params.width || 1024,
    height: params.height || 1024,
  };

  // Model-specific parameters
  if (params.model === 'nano-banana') {
    requestBody.steps = params.steps || 28;
    requestBody.guidance = params.guidance || 3.5;
    requestBody.aspect_ratio = calculateAspectRatio(params.width || 1024, params.height || 1024);
    if (params.negative_prompt) requestBody.negative_prompt = params.negative_prompt;
    if (params.seed) requestBody.seed = params.seed;
  } else if (params.model === 'seedreem') {
    requestBody.aspect_ratio = calculateAspectRatio(params.width || 1024, params.height || 1024);
    requestBody.output_format = 'png';
    requestBody.output_quality = 90;
    if (params.seed) requestBody.seed = params.seed;
    if (params.num_outputs) requestBody.num_outputs = params.num_outputs;
  } else if (params.model === 'gpt-4o-image') {
    requestBody.size = `${params.width || 1024}x${params.height || 1024}`;
    requestBody.quality = 'hd';
    requestBody.style = 'vivid';
  }

  try {
    const response = await fetch(`${KIE_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      task_id: data.task_id || data.id,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error creating image task:', error);
    throw error;
  }
}

/**
 * Check task status
 */
export async function checkImageTaskStatus(taskId: string, model: ImageModel): Promise<ImageTaskResponse> {
  const endpoint = getStatusEndpointForModel(model);

  try {
    const response = await fetch(`${KIE_API_BASE}${endpoint}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      task_id: taskId,
      status: mapStatus(data.status),
      image_urls: data.output?.images || data.images || data.data,
      error: data.error,
    };
  } catch (error) {
    console.error('Error checking image task status:', error);
    throw error;
  }
}


/**
 * Helper functions
 */
function getEndpointForModel(model: ImageModel): string {
  switch (model) {
    case 'nano-banana':
      return '/v1/nano-banana/generate';
    case 'seedreem':
      return '/v1/seedreem/generate';
    case 'gpt-4o-image':
      return '/v1/gpt-4o-image/generate';
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

function getStatusEndpointForModel(model: ImageModel): string {
  switch (model) {
    case 'nano-banana':
      return '/v1/nano-banana/status';
    case 'seedreem':
      return '/v1/seedreem/status';
    case 'gpt-4o-image':
      return '/v1/gpt-4o-image/status';
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

function mapStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('complete') || lowerStatus.includes('success')) return 'completed';
  if (lowerStatus.includes('fail') || lowerStatus.includes('error')) return 'failed';
  if (lowerStatus.includes('process') || lowerStatus.includes('running')) return 'processing';
  return 'pending';
}

function calculateAspectRatio(width: number, height: number): string {
  if (width === height) return '1:1';
  if (width > height) {
    if (width / height >= 1.7) return '16:9';
    return '4:3';
  }
  if (height / width >= 1.7) return '9:16';
  return '3:4';
}

export function isKieImageAvailable(): boolean {
  return !!KIE_API_KEY;
}

/**
 * Legacy compatibility wrapper for generateImage
 * Matches the old API signature: (prompt: string, model: ImageModel, userId?: string)
 */
export async function generateImage(
  promptOrParams: string | ImageGenerateParams,
  modelOrProgress?: ImageModel | ((status: string) => void),
  userIdOrUndefined?: string
): Promise<{ url: string; seed?: number }> {
  let params: ImageGenerateParams;
  let onProgress: ((status: string) => void) | undefined;

  // Handle both old and new API signatures
  if (typeof promptOrParams === 'string') {
    // Old API: generateImage(prompt, model, userId)
    params = {
      prompt: promptOrParams,
      model: (modelOrProgress as ImageModel) || 'nano-banana',
      width: 1024,
      height: 1024,
    };
  } else {
    // New API: generateImage(params, onProgress)
    params = promptOrParams;
    onProgress = modelOrProgress as ((status: string) => void) | undefined;
  }

  // Call the actual implementation
  const images = await generateImageTask(params, onProgress);

  return {
    url: images[0],
    seed: params.seed,
  };
}

/**
 * Internal implementation with correct signature
 */
async function generateImageTask(
  params: ImageGenerateParams,
  onProgress?: (status: string) => void
): Promise<string[]> {
  onProgress?.('Creating task...');
  const taskResponse = await createImageTask(params);
  const taskId = taskResponse.task_id;

  onProgress?.('Processing...');

  // Poll for completion
  const maxAttempts = 120; // 2 minutes max
  const pollInterval = 1000; // 1 second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const status = await checkImageTaskStatus(taskId, params.model);

    if (status.status === 'completed' && status.image_urls && status.image_urls.length > 0) {
      onProgress?.('Completed!');
      return status.image_urls;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Image generation failed');
    }

    onProgress?.(`Processing... (${attempt + 1}/${maxAttempts})`);
  }

  throw new Error('Image generation timed out');
}
