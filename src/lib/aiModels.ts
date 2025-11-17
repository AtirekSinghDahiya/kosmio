export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const AI_MODELS: AIModel[] = [
  // Mistral Models (26)
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral AI', description: 'Most powerful Mistral model', category: 'chat' },
  { id: 'mistralai/mistral-medium', name: 'Mistral Medium', provider: 'Mistral AI', description: 'Balanced performance', category: 'chat' },
  { id: 'mistralai/mistral-small', name: 'Mistral Small', provider: 'Mistral AI', description: 'Fast and efficient', category: 'chat' },
  { id: 'mistralai/mistral-tiny', name: 'Mistral Tiny', provider: 'Mistral AI', description: 'Ultra-fast model', category: 'chat' },
  { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo', provider: 'Mistral AI', description: '12B parameter model', category: 'chat' },
  { id: 'mistralai/pixtral-large', name: 'Pixtral Large', provider: 'Mistral AI', description: 'Vision + text model', category: 'chat' },
  { id: 'mistralai/pixtral-12b', name: 'Pixtral 12B', provider: 'Mistral AI', description: '12B vision model', category: 'chat' },
  { id: 'mistralai/codestral', name: 'Codestral', provider: 'Mistral AI', description: 'Code-specialized model', category: 'code' },
  { id: 'mistralai/codestral-mamba', name: 'Codestral Mamba', provider: 'Mistral AI', description: 'Fast code model', category: 'code' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B Instruct', provider: 'Mistral AI', description: '7B instruction model', category: 'chat' },
  { id: 'mistralai/mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral AI', description: 'MoE 8x7B model', category: 'chat' },
  { id: 'mistralai/mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral AI', description: 'Large MoE model', category: 'chat' },
  { id: 'mistralai/mistral-large-2407', name: 'Mistral Large 2407', provider: 'Mistral AI', description: 'July 2024 release', category: 'chat' },
  { id: 'mistralai/mistral-large-2411', name: 'Mistral Large 2411', provider: 'Mistral AI', description: 'November 2024 release', category: 'chat' },
  { id: 'mistralai/mistral-medium-2312', name: 'Mistral Medium 2312', provider: 'Mistral AI', description: 'December 2023 release', category: 'chat' },
  { id: 'mistralai/mistral-small-2402', name: 'Mistral Small 2402', provider: 'Mistral AI', description: 'February 2024 release', category: 'chat' },
  { id: 'mistralai/mistral-small-2409', name: 'Mistral Small 2409', provider: 'Mistral AI', description: 'September 2024 release', category: 'chat' },
  { id: 'mistralai/open-mistral-7b', name: 'Open Mistral 7B', provider: 'Mistral AI', description: 'Open-source 7B', category: 'chat' },
  { id: 'mistralai/open-mixtral-8x7b', name: 'Open Mixtral 8x7B', provider: 'Mistral AI', description: 'Open-source MoE', category: 'chat' },
  { id: 'mistralai/open-mixtral-8x22b', name: 'Open Mixtral 8x22B', provider: 'Mistral AI', description: 'Large open MoE', category: 'chat' },
  { id: 'mistralai/ministral-3b', name: 'Ministral 3B', provider: 'Mistral AI', description: 'Edge-optimized 3B', category: 'chat' },
  { id: 'mistralai/ministral-8b', name: 'Ministral 8B', provider: 'Mistral AI', description: 'Edge-optimized 8B', category: 'chat' },
  { id: 'mistralai/mistral-embed', name: 'Mistral Embed', provider: 'Mistral AI', description: 'Embedding model', category: 'chat' },
  { id: 'mistralai/mistral-moderation', name: 'Mistral Moderation', provider: 'Mistral AI', description: 'Content moderation', category: 'chat' },
  { id: 'mistralai/mistral-large-free', name: 'Mistral Large Free', provider: 'Mistral AI', description: 'Free tier large model', category: 'chat' },
  { id: 'mistralai/pixtral-free', name: 'Pixtral Free', provider: 'Mistral AI', description: 'Free vision model', category: 'chat' },

  // Microsoft Models (8)
  { id: 'microsoft/phi-3-medium', name: 'Phi-3 Medium', provider: 'Microsoft', description: '14B parameter model', category: 'chat' },
  { id: 'microsoft/phi-3-mini', name: 'Phi-3 Mini', provider: 'Microsoft', description: '3.8B parameter model', category: 'chat' },
  { id: 'microsoft/phi-3-small', name: 'Phi-3 Small', provider: 'Microsoft', description: '7B parameter model', category: 'chat' },
  { id: 'microsoft/phi-3.5-mini', name: 'Phi-3.5 Mini', provider: 'Microsoft', description: 'Updated 3.8B model', category: 'chat' },
  { id: 'microsoft/phi-3.5-moe', name: 'Phi-3.5 MoE', provider: 'Microsoft', description: '16x3.8B MoE model', category: 'chat' },
  { id: 'microsoft/phi-3.5-vision', name: 'Phi-3.5 Vision', provider: 'Microsoft', description: '4.2B multimodal', category: 'chat' },
  { id: 'microsoft/wizardlm-2-8x22b', name: 'WizardLM 2 8x22B', provider: 'Microsoft', description: 'Large reasoning model', category: 'chat' },
  { id: 'microsoft/wizardlm-2-7b', name: 'WizardLM 2 7B', provider: 'Microsoft', description: 'Compact reasoning', category: 'chat' },

  // Qwen Models (30+)
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', provider: 'Qwen', description: 'Large instruction model', category: 'chat' },
  { id: 'qwen/qwen-2.5-32b-instruct', name: 'Qwen 2.5 32B Instruct', provider: 'Qwen', description: 'Mid-size instruction', category: 'chat' },
  { id: 'qwen/qwen-2.5-14b-instruct', name: 'Qwen 2.5 14B Instruct', provider: 'Qwen', description: 'Balanced instruction', category: 'chat' },
  { id: 'qwen/qwen-2.5-7b-instruct', name: 'Qwen 2.5 7B Instruct', provider: 'Qwen', description: 'Compact instruction', category: 'chat' },
  { id: 'qwen/qwen-2.5-3b-instruct', name: 'Qwen 2.5 3B Instruct', provider: 'Qwen', description: 'Small instruction', category: 'chat' },
  { id: 'qwen/qwen-2.5-1.5b-instruct', name: 'Qwen 2.5 1.5B Instruct', provider: 'Qwen', description: 'Tiny instruction', category: 'chat' },
  { id: 'qwen/qwen-2.5-0.5b-instruct', name: 'Qwen 2.5 0.5B Instruct', provider: 'Qwen', description: 'Ultra-small model', category: 'chat' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen', description: 'Large code model', category: 'code' },
  { id: 'qwen/qwen-2.5-coder-7b-instruct', name: 'Qwen 2.5 Coder 7B', provider: 'Qwen', description: 'Compact code model', category: 'code' },
  { id: 'qwen/qwen-2.5-coder-1.5b-instruct', name: 'Qwen 2.5 Coder 1.5B', provider: 'Qwen', description: 'Small code model', category: 'code' },
  { id: 'qwen/qwen-2.5-math-72b-instruct', name: 'Qwen 2.5 Math 72B', provider: 'Qwen', description: 'Math-specialized', category: 'chat' },
  { id: 'qwen/qwen-2.5-math-7b-instruct', name: 'Qwen 2.5 Math 7B', provider: 'Qwen', description: 'Compact math', category: 'chat' },
  { id: 'qwen/qwq-32b-preview', name: 'QwQ 32B Preview', provider: 'Qwen', description: 'Reasoning preview', category: 'chat' },
  { id: 'qwen/qwen-2-vl-72b-instruct', name: 'Qwen 2 VL 72B', provider: 'Qwen', description: 'Large vision model', category: 'chat' },
  { id: 'qwen/qwen-2-vl-7b-instruct', name: 'Qwen 2 VL 7B', provider: 'Qwen', description: 'Compact vision', category: 'chat' },
  { id: 'qwen/qwen-2-vl-2b-instruct', name: 'Qwen 2 VL 2B', provider: 'Qwen', description: 'Small vision', category: 'chat' },
  { id: 'qwen/qwen-plus', name: 'Qwen Plus', provider: 'Qwen', description: 'Enhanced model', category: 'chat' },
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo', provider: 'Qwen', description: 'Fast inference', category: 'chat' },
  { id: 'qwen/qwen-max', name: 'Qwen Max', provider: 'Qwen', description: 'Maximum performance', category: 'chat' },
  { id: 'qwen/qwen-long', name: 'Qwen Long', provider: 'Qwen', description: 'Extended context', category: 'chat' },
  { id: 'qwen/qwen-2-72b', name: 'Qwen 2 72B', provider: 'Qwen', description: 'Previous gen large', category: 'chat' },
  { id: 'qwen/qwen-2-57b-a14b', name: 'Qwen 2 57B A14B', provider: 'Qwen', description: 'MoE model', category: 'chat' },
  { id: 'qwen/qwen-2-7b', name: 'Qwen 2 7B', provider: 'Qwen', description: 'Previous gen compact', category: 'chat' },
  { id: 'qwen/qwen-1.5-110b', name: 'Qwen 1.5 110B', provider: 'Qwen', description: 'Legacy large model', category: 'chat' },
  { id: 'qwen/qwen-1.5-72b', name: 'Qwen 1.5 72B', provider: 'Qwen', description: 'Legacy 72B', category: 'chat' },
  { id: 'qwen/qwen-1.5-32b', name: 'Qwen 1.5 32B', provider: 'Qwen', description: 'Legacy 32B', category: 'chat' },
  { id: 'qwen/qwen-1.5-14b', name: 'Qwen 1.5 14B', provider: 'Qwen', description: 'Legacy 14B', category: 'chat' },
  { id: 'qwen/qwen-1.5-7b', name: 'Qwen 1.5 7B', provider: 'Qwen', description: 'Legacy 7B', category: 'chat' },
  { id: 'qwen/qwen-vl-plus', name: 'Qwen VL Plus', provider: 'Qwen', description: 'Enhanced vision', category: 'chat' },
  { id: 'qwen/qwen-vl-max', name: 'Qwen VL Max', provider: 'Qwen', description: 'Maximum vision', category: 'chat' },
  { id: 'qwen3-vl-30b-free', name: 'Qwen3 VL 30B Free', provider: 'Qwen', description: 'Free vision model', category: 'chat' },

  // Meta Llama Models (7)
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Latest large model', category: 'chat' },
  { id: 'meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', provider: 'Meta', description: 'Large vision model', category: 'chat' },
  { id: 'meta-llama/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', provider: 'Meta', description: 'Mid vision model', category: 'chat' },
  { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', provider: 'Meta', description: 'Compact model', category: 'chat' },
  { id: 'meta-llama/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', provider: 'Meta', description: 'Small model', category: 'chat' },
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', description: 'Massive model', category: 'chat' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', description: 'Large 3.1 model', category: 'chat' },
  { id: 'llama-4-maverick-free', name: 'Llama 4 Maverick Free', provider: 'Meta', description: 'Free latest Llama', category: 'chat' },

  // Kimi/MoonshotAI Models (6)
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'MoonshotAI', description: 'Advanced reasoning', category: 'chat' },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2 0905', provider: 'MoonshotAI', description: 'September release', category: 'chat' },
  { id: 'moonshotai/kimi-linear-48b-a3b-instruct', name: 'Kimi Linear 48B', provider: 'MoonshotAI', description: 'Linear attention', category: 'chat' },
  { id: 'moonshotai/moonshot-v1-8k', name: 'Moonshot v1 8K', provider: 'MoonshotAI', description: '8K context', category: 'chat' },
  { id: 'moonshotai/moonshot-v1-32k', name: 'Moonshot v1 32K', provider: 'MoonshotAI', description: '32K context', category: 'chat' },
  { id: 'kimi-k2-free', name: 'Kimi K2 Free', provider: 'MoonshotAI', description: 'Free long context', category: 'chat' },

  // GLM Models (6)
  { id: 'zhipuai/glm-4-plus', name: 'GLM-4 Plus', provider: 'Z.AI', description: 'Enhanced GLM-4', category: 'chat' },
  { id: 'zhipuai/glm-4-air', name: 'GLM-4 Air', provider: 'Z.AI', description: 'Lightweight GLM-4', category: 'chat' },
  { id: 'zhipuai/glm-4-flash', name: 'GLM-4 Flash', provider: 'Z.AI', description: 'Fast GLM-4', category: 'chat' },
  { id: 'zhipuai/glm-4v-plus', name: 'GLM-4V Plus', provider: 'Z.AI', description: 'Vision enhanced', category: 'chat' },
  { id: 'zhipuai/glm-4-long', name: 'GLM-4 Long', provider: 'Z.AI', description: 'Extended context', category: 'chat' },
  { id: 'glm-4.6', name: 'GLM 4.6', provider: 'Z.AI', description: 'Latest GLM', category: 'chat' },

  // Grok Models (6)
  { id: 'x-ai/grok-beta', name: 'Grok Beta', provider: 'X.AI', description: 'Beta release', category: 'chat' },
  { id: 'x-ai/grok-vision-beta', name: 'Grok Vision Beta', provider: 'X.AI', description: 'Vision beta', category: 'chat' },
  { id: 'x-ai/grok-2-vision-1212', name: 'Grok 2 Vision 1212', provider: 'X.AI', description: 'December vision', category: 'chat' },
  { id: 'x-ai/grok-2-1212', name: 'Grok 2 1212', provider: 'X.AI', description: 'December release', category: 'chat' },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'X.AI', description: 'Fast reasoning with images', category: 'chat' },
  { id: 'x-ai/grok-2-code-fast', name: 'Grok 2 Code Fast', provider: 'X.AI', description: 'Ultra-fast code generation', category: 'code' },

  // Perplexity Models (6)
  { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Sonar Small Online', provider: 'Perplexity', description: 'Small web search', category: 'chat' },
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Sonar Large Online', provider: 'Perplexity', description: 'Large web search', category: 'chat' },
  { id: 'perplexity/llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge Online', provider: 'Perplexity', description: 'Huge web search', category: 'chat' },
  { id: 'perplexity-sonar', name: 'Perplexity Sonar', provider: 'Perplexity', description: 'Web search enabled', category: 'chat' },
  { id: 'perplexity-sonar-pro', name: 'Perplexity Sonar Pro', provider: 'Perplexity', description: 'Pro web search with vision', category: 'chat' },
  { id: 'perplexity-sonar-reasoning', name: 'Sonar Reasoning Pro', provider: 'Perplexity', description: 'Advanced reasoning + search', category: 'chat' },

  // Claude Models
  { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', description: 'Latest Sonnet', category: 'chat' },
  { id: 'anthropic/claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'October 2024 Sonnet', category: 'chat' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Latest Haiku', category: 'chat' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most powerful Claude 3', category: 'chat' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced Claude 3', category: 'chat' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast Claude 3', category: 'chat' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Fast Claude 4.5', category: 'chat' },
  { id: 'claude-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Advanced reasoning', category: 'chat' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', description: 'Powerful Opus', category: 'chat' },
  { id: 'claude-opus-4.1', name: 'Claude Opus 4.1', provider: 'Anthropic', description: 'Ultimate AI model', category: 'chat' },

  // Google Gemini Models
  { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', provider: 'Google', description: 'Experimental flash', category: 'chat' },
  { id: 'google/gemini-2.0-flash-thinking-exp-1219', name: 'Gemini 2.0 Flash Thinking', provider: 'Google', description: 'Thinking mode', category: 'chat' },
  { id: 'google/gemini-exp-1206', name: 'Gemini Exp 1206', provider: 'Google', description: 'December experiment', category: 'chat' },
  { id: 'google/gemini-exp-1121', name: 'Gemini Exp 1121', provider: 'Google', description: 'November experiment', category: 'chat' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', description: 'Professional model', category: 'chat' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google', description: 'Fast model', category: 'chat' },
  { id: 'google/gemini-flash-1.5-8b', name: 'Gemini Flash 1.5 8B', provider: 'Google', description: 'Compact flash', category: 'chat' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Original pro', category: 'chat' },
  { id: 'gemini-flash-lite-free', name: 'Gemini 2.5 Flash Lite', provider: 'Google', description: 'Free multimodal AI', category: 'chat' },
  { id: 'gemini-flash-image', name: 'Gemini 2.5 Flash Image', provider: 'Google', description: 'Image focused', category: 'chat' },

  // OpenAI Models
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Omni model', category: 'chat' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Compact omni', category: 'chat' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'Fast GPT-4', category: 'chat' },
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Original GPT-4', category: 'chat' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and efficient', category: 'chat' },
  { id: 'openai/o1', name: 'o1', provider: 'OpenAI', description: 'Reasoning model', category: 'chat' },
  { id: 'openai/o1-mini', name: 'o1-mini', provider: 'OpenAI', description: 'Compact reasoning', category: 'chat' },
  { id: 'openai/o1-preview', name: 'o1-preview', provider: 'OpenAI', description: 'Preview reasoning', category: 'chat' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI', description: 'Latest GPT with reasoning', category: 'chat' },
  { id: 'openai/gpt-5.1-chat', name: 'GPT-5.1 Chat', provider: 'OpenAI', description: 'Chat-optimized GPT-5.1', category: 'chat' },
  { id: 'gpt-5-chat', name: 'GPT-5 Chat', provider: 'OpenAI', description: 'Latest ChatGPT', category: 'chat' },

  // DeepSeek Models
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Chat model', category: 'chat' },
  { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code model', category: 'code' },
  { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek', description: 'Reasoning model', category: 'chat' },
  { id: 'deepseek-v3.1-free', name: 'DeepSeek V3.1 Free', provider: 'DeepSeek', description: 'Free efficient model', category: 'chat' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Most advanced DeepSeek', category: 'chat' },

  // NVIDIA Models
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'Nemotron 4 340B', provider: 'NVIDIA', description: 'Large reasoning', category: 'chat' },
  { id: 'nemotron-nano-free', name: 'Nemotron Nano 9B V2', provider: 'NVIDIA', description: 'Fast nano model', category: 'chat' },
  { id: 'nemotron-super', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Powerful reasoning', category: 'chat' },

  // Amazon Models
  { id: 'amazon/nova-lite-v1', name: 'Nova Lite 1.0', provider: 'Amazon', description: 'Fast multimodal', category: 'chat' },
  { id: 'amazon/nova-micro-v1', name: 'Nova Micro 1.0', provider: 'Amazon', description: 'Ultra-fast text', category: 'chat' },
  { id: 'amazon/nova-pro-v1', name: 'Nova Pro 1.0', provider: 'Amazon', description: 'Professional multimodal', category: 'chat' },
  { id: 'amazon/nova-premier-v1', name: 'Nova Premier 1.0', provider: 'Amazon', description: 'Premier multimodal AI', category: 'chat' },

  // Cohere Models
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere', description: 'Enhanced reasoning', category: 'chat' },
  { id: 'cohere/command-r', name: 'Command R', provider: 'Cohere', description: 'Balanced reasoning', category: 'chat' },
  { id: 'cohere/command', name: 'Command', provider: 'Cohere', description: 'General purpose', category: 'chat' },
  { id: 'cohere/command-light', name: 'Command Light', provider: 'Cohere', description: 'Fast and efficient', category: 'chat' },
  { id: 'cohere/command-nightly', name: 'Command Nightly', provider: 'Cohere', description: 'Latest features', category: 'chat' },

  // Baidu Models
  { id: 'baidu/ernie-4.5-21b-a3b', name: 'ERNIE 4.5 21B A3B', provider: 'Baidu', description: 'Efficient reasoning', category: 'chat' },
  { id: 'baidu/ernie-4.5-vl-28b-a3b', name: 'ERNIE 4.5 VL 28B A3B', provider: 'Baidu', description: 'Vision-language', category: 'chat' },
  { id: 'baidu/ernie-4.5-vl-424b-a47b', name: 'ERNIE 4.5 VL 424B A47B', provider: 'Baidu', description: 'Large vision-language', category: 'chat' },
  { id: 'baidu/ernie-4.5-300b-a47b', name: 'ERNIE 4.5 300B A47B', provider: 'Baidu', description: 'Massive reasoning', category: 'chat' },
  { id: 'ernie-4.5', name: 'ERNIE 4.5 21B Thinking', provider: 'Baidu', description: 'Thinking model', category: 'chat' },

  // MiniMax Models
  { id: 'minimax/minimax-01', name: 'MiniMax-01', provider: 'MiniMax', description: 'Multimodal with vision', category: 'chat' },
  { id: 'minimax/minimax-m2', name: 'MiniMax M2', provider: 'MiniMax', description: 'Advanced reasoning', category: 'chat' },
  { id: 'minimax/minimax-m1', name: 'MiniMax M1', provider: 'MiniMax', description: 'General purpose', category: 'chat' },

  // Sherlock AI Models
  { id: 'openrouter/sherlock-dash-alpha', name: 'Sherlock Dash Alpha', provider: 'Sherlock AI', description: 'Fast multimodal with vision', category: 'chat' },
  { id: 'openrouter/sherlock-think-alpha', name: 'Sherlock Think Alpha', provider: 'Sherlock AI', description: 'Advanced reasoning model', category: 'chat' },

  // Other Models
  { id: 'openrouter/auto', name: 'Auto Router', provider: 'OpenRouter', description: 'Auto-selects best model', category: 'chat' },
  { id: 'codex-mini', name: 'Codex Mini', provider: 'OpenAI', description: 'Lightweight coding', category: 'code' },
  { id: 'granite-4.0', name: 'Granite 4.0 Micro', provider: 'IBM', description: 'IBM micro model', category: 'chat' },

  // Code Models
  { id: 'gpt-5-codex', name: 'GPT-5 Codex', provider: 'OpenAI', description: 'Best for coding', category: 'code' },
  { id: 'openai/gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'OpenAI', description: 'Code-specialized GPT-5.1', category: 'code' },
  { id: 'openai/gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'OpenAI', description: 'Fast code model', category: 'code' },

  // Image/Video/Audio Models
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', description: 'High quality images', category: 'image' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'Stability AI', description: 'Open source image gen', category: 'image' },
  { id: 'firefly', name: 'Firefly', provider: 'Adobe', description: 'Commercial safe images', category: 'image' },
  { id: 'sora', name: 'Sora', provider: 'OpenAI', description: 'Text to video', category: 'video' },
  { id: 'eleven-labs', name: 'ElevenLabs', provider: 'ElevenLabs', description: 'Natural voice synthesis', category: 'audio' },
];

export const getModelsByCategory = (category: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  return AI_MODELS.filter(m => m.category === category);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(m => m.id === id);
};

export const searchModels = (query: string, category?: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  const lowerQuery = query.toLowerCase();
  let models = AI_MODELS;

  if (category) {
    models = models.filter(m => m.category === category);
  }

  return models.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.provider.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery)
  );
};
