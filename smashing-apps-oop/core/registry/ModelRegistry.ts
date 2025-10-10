/**
 * Model Registry
 * 
 * Central registry for all AI models across providers
 * Maintains model capabilities, pricing, and metadata
 */

export interface ModelCapabilities {
  maxTokens: number;
  supportsImages: boolean;
  supportsFunctions: boolean;
  supportsStreaming: boolean;
  contextWindow: number;
}

export interface ModelPricing {
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  currency: string;
}

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  description: string;
  type: 'chat' | 'completion' | 'image';
  capabilities: ModelCapabilities;
  pricing?: ModelPricing;
  deprecated?: boolean;
  releaseDate?: string;
}

class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, ModelInfo> = new Map();
  
  private constructor() {
    this.initializeModels();
  }
  
  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }
  
  /**
   * Initialize the model registry with known models
   */
  private initializeModels(): void {
    // OpenAI GPT-5 Models (Newest)
    this.registerModel({
      id: 'gpt-5',
      provider: 'openai',
      name: 'GPT-5',
      description: 'Latest GPT-5 model with advanced reasoning',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 256000
      },
      pricing: {
        inputCostPer1kTokens: 0.01,
        outputCostPer1kTokens: 0.03,
        currency: 'USD'
      },
      releaseDate: '2025-08-07'
    });

    this.registerModel({
      id: 'gpt-5-pro',
      provider: 'openai',
      name: 'GPT-5 Pro',
      description: 'Most capable GPT-5 model',
      type: 'chat',
      capabilities: {
        maxTokens: 32768,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 512000
      },
      pricing: {
        inputCostPer1kTokens: 0.02,
        outputCostPer1kTokens: 0.06,
        currency: 'USD'
      },
      releaseDate: '2025-10-06'
    });

    this.registerModel({
      id: 'gpt-5-mini',
      provider: 'openai',
      name: 'GPT-5 Mini',
      description: 'Efficient GPT-5 model',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 256000
      },
      pricing: {
        inputCostPer1kTokens: 0.002,
        outputCostPer1kTokens: 0.008,
        currency: 'USD'
      },
      releaseDate: '2025-08-07'
    });

    this.registerModel({
      id: 'gpt-5-nano',
      provider: 'openai',
      name: 'GPT-5 Nano',
      description: 'Smallest GPT-5 model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: false,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.001,
        outputCostPer1kTokens: 0.004,
        currency: 'USD'
      },
      releaseDate: '2025-08-07'
    });

    // OpenAI O3 Models
    this.registerModel({
      id: 'o3',
      provider: 'openai',
      name: 'O3',
      description: 'Advanced reasoning model',
      type: 'chat',
      capabilities: {
        maxTokens: 100000,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.06,
        currency: 'USD'
      },
      releaseDate: '2025-04-16'
    });

    this.registerModel({
      id: 'o3-pro',
      provider: 'openai',
      name: 'O3 Pro',
      description: 'Most capable O3 reasoning model',
      type: 'chat',
      capabilities: {
        maxTokens: 100000,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.03,
        outputCostPer1kTokens: 0.12,
        currency: 'USD'
      },
      releaseDate: '2025-04-16'
    });

    this.registerModel({
      id: 'o3-mini',
      provider: 'openai',
      name: 'O3 Mini',
      description: 'Efficient reasoning model',
      type: 'chat',
      capabilities: {
        maxTokens: 65536,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.012,
        currency: 'USD'
      },
      releaseDate: '2025-01-31'
    });

    // OpenAI O4 Models
    this.registerModel({
      id: 'o4-mini',
      provider: 'openai',
      name: 'O4 Mini',
      description: 'Next-gen efficient reasoning model',
      type: 'chat',
      capabilities: {
        maxTokens: 65536,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.012,
        currency: 'USD'
      },
      releaseDate: '2025-06-01'
    });

    // OpenAI GPT-4.1 Models
    this.registerModel({
      id: 'gpt-4.1',
      provider: 'openai',
      name: 'GPT-4.1',
      description: 'Enhanced GPT-4 model',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 256000
      },
      pricing: {
        inputCostPer1kTokens: 0.008,
        outputCostPer1kTokens: 0.024,
        currency: 'USD'
      },
      releaseDate: '2025-04-14'
    });

    this.registerModel({
      id: 'gpt-4.1-mini',
      provider: 'openai',
      name: 'GPT-4.1 Mini',
      description: 'Efficient GPT-4.1 model',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.004,
        outputCostPer1kTokens: 0.012,
        currency: 'USD'
      },
      releaseDate: '2025-04-14'
    });

    // OpenAI GPT-4o Models
    this.registerModel({
      id: 'gpt-4o',
      provider: 'openai',
      name: 'GPT-4o',
      description: 'Most capable GPT-4 model with vision',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.005,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      },
      releaseDate: '2024-05-13'
    });

    this.registerModel({
      id: 'gpt-4o-mini',
      provider: 'openai',
      name: 'GPT-4o Mini',
      description: 'Affordable and intelligent small model',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.00015,
        outputCostPer1kTokens: 0.0006,
        currency: 'USD'
      },
      releaseDate: '2024-07-18'
    });

    this.registerModel({
      id: 'chatgpt-4o-latest',
      provider: 'openai',
      name: 'ChatGPT-4o Latest',
      description: 'Latest ChatGPT-4o model',
      type: 'chat',
      capabilities: {
        maxTokens: 16384,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.005,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      },
      releaseDate: '2024-11-20'
    });

    // OpenAI O1 Models
    this.registerModel({
      id: 'o1',
      provider: 'openai',
      name: 'O1',
      description: 'Reasoning model with extended thinking',
      type: 'chat',
      capabilities: {
        maxTokens: 100000,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.06,
        currency: 'USD'
      },
      releaseDate: '2024-12-17'
    });

    this.registerModel({
      id: 'o1-mini',
      provider: 'openai',
      name: 'O1 Mini',
      description: 'Efficient reasoning model',
      type: 'chat',
      capabilities: {
        maxTokens: 65536,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.012,
        currency: 'USD'
      },
      releaseDate: '2024-09-12'
    });

    this.registerModel({
      id: 'gpt-3.5-turbo',
      provider: 'openai',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and affordable model',
      type: 'chat',
      capabilities: {
        maxTokens: 4096,
        supportsImages: false,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 16385
      },
      pricing: {
        inputCostPer1kTokens: 0.0005,
        outputCostPer1kTokens: 0.0015,
        currency: 'USD'
      },
      releaseDate: '2023-03-01'
    });

    // Anthropic Claude 4.5 Models (Newest)
    this.registerModel({
      id: 'claude-sonnet-4-5-20250929',
      provider: 'anthropic',
      name: 'Claude Sonnet 4.5',
      description: 'Latest Claude model with enhanced capabilities',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      },
      releaseDate: '2025-09-29'
    });

    // Anthropic Claude 4 Models
    this.registerModel({
      id: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      name: 'Claude Sonnet 4',
      description: 'Advanced Claude model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      },
      releaseDate: '2024-10-22'
    });

    this.registerModel({
      id: 'claude-opus-4-20250514',
      provider: 'anthropic',
      name: 'Claude Opus 4',
      description: 'Powerful Claude model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.075,
        currency: 'USD'
      },
      releaseDate: '2024-10-22'
    });

    // Anthropic Claude 4.1 Models
    this.registerModel({
      id: 'claude-opus-4-1-20250805',
      provider: 'anthropic',
      name: 'Claude Opus 4.1',
      description: 'Enhanced Claude Opus model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.075,
        currency: 'USD'
      },
      releaseDate: '2025-08-05'
    });

    // Anthropic Claude 3.7 Models
    this.registerModel({
      id: 'claude-3-7-sonnet-20250219',
      provider: 'anthropic',
      name: 'Claude 3.7 Sonnet',
      description: 'Advanced Claude 3.7 model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      },
      releaseDate: '2025-02-19'
    });

    // Anthropic Claude 3.5 Models
    this.registerModel({
      id: 'claude-3-5-haiku-20241022',
      provider: 'anthropic',
      name: 'Claude 3.5 Haiku',
      description: 'Fast and efficient Claude model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: false,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.001,
        outputCostPer1kTokens: 0.005,
        currency: 'USD'
      },
      releaseDate: '2024-10-22'
    });

    // Anthropic Claude 3 Models
    this.registerModel({
      id: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      name: 'Claude 3 Haiku',
      description: 'Fastest Claude 3 model',
      type: 'chat',
      capabilities: {
        maxTokens: 4096,
        supportsImages: false,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.00025,
        outputCostPer1kTokens: 0.00125,
        currency: 'USD'
      },
      releaseDate: '2024-03-07'
    });

    // Google Gemini 2.5 Models (Newest)
    this.registerModel({
      id: 'gemini-2.5-flash',
      provider: 'gemini',
      name: 'Gemini 2.5 Flash',
      description: 'Latest Gemini text model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.0,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2025-09-01'
    });

    this.registerModel({
      id: 'gemini-2.5-pro',
      provider: 'gemini',
      name: 'Gemini 2.5 Pro',
      description: 'Most capable Gemini 2.5 model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 2000000
      },
      pricing: {
        inputCostPer1kTokens: 0.00125,
        outputCostPer1kTokens: 0.005,
        currency: 'USD'
      },
      releaseDate: '2025-09-01'
    });

    this.registerModel({
      id: 'gemini-2.5-flash-lite',
      provider: 'gemini',
      name: 'Gemini 2.5 Flash Lite',
      description: 'Lightweight Gemini 2.5 model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: false,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.0,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2025-09-01'
    });

    // OpenAI Image Models
    this.registerModel({
      id: 'gpt-image-1',
      provider: 'openai',
      name: 'GPT Image 1',
      description: 'Primary OpenAI multimodal image model for generation, editing, and variations',
      type: 'image',
      capabilities: {
        maxTokens: 0,
        supportsImages: true,
        supportsFunctions: false,
        supportsStreaming: false,
        contextWindow: 0
      },
      pricing: {
        inputCostPer1kTokens: 0.04,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2025-01-01'
    });

    this.registerModel({
      id: 'dall-e-3',
      provider: 'openai',
      name: 'DALL-E 3',
      description: 'Advanced OpenAI image generation model (legacy)',
      type: 'image',
      capabilities: {
        maxTokens: 0,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: false,
        contextWindow: 0
      },
      pricing: {
        inputCostPer1kTokens: 0.04,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2023-11-01'
    });

    this.registerModel({
      id: 'dall-e-2',
      provider: 'openai',
      name: 'DALL-E 2',
      description: 'OpenAI image generation model (legacy)',
      type: 'image',
      capabilities: {
        maxTokens: 0,
        supportsImages: false,
        supportsFunctions: false,
        supportsStreaming: false,
        contextWindow: 0
      },
      pricing: {
        inputCostPer1kTokens: 0.02,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2022-11-01'
    });

    // Gemini 2.5 Image Models
    this.registerModel({
      id: 'gemini-2.5-flash-image',
      provider: 'gemini',
      name: 'Gemini 2.5 Flash Image',
      description: 'Gemini model for image generation',
      type: 'image',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: false,
        supportsStreaming: false,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.0,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2025-09-01'
    });

    this.registerModel({
      id: 'gemini-2.5-flash-image-preview',
      provider: 'gemini',
      name: 'Gemini 2.5 Flash Image (Preview)',
      description: 'Preview version of Gemini image generation',
      type: 'image',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: false,
        supportsStreaming: false,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.0,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2025-09-01'
    });

    // Google Gemini 2.0 Models
    this.registerModel({
      id: 'gemini-2.0-flash-exp',
      provider: 'gemini',
      name: 'Gemini 2.0 Flash',
      description: 'Fast and efficient Gemini model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.0,
        outputCostPer1kTokens: 0.0,
        currency: 'USD'
      },
      releaseDate: '2024-12-11'
    });

    this.registerModel({
      id: 'gemini-1.5-pro',
      provider: 'gemini',
      name: 'Gemini 1.5 Pro',
      description: 'Advanced Gemini model with 2M context',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 2000000
      },
      pricing: {
        inputCostPer1kTokens: 0.00125,
        outputCostPer1kTokens: 0.005,
        currency: 'USD'
      },
      releaseDate: '2024-05-14'
    });

    this.registerModel({
      id: 'gemini-1.5-flash',
      provider: 'gemini',
      name: 'Gemini 1.5 Flash',
      description: 'Fast and efficient Gemini model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 1000000
      },
      pricing: {
        inputCostPer1kTokens: 0.000075,
        outputCostPer1kTokens: 0.0003,
        currency: 'USD'
      },
      releaseDate: '2024-05-14'
    });
  }
  
  /**
   * Register a new model
   */
  public registerModel(model: ModelInfo): void {
    this.models.set(model.id, model);
  }
  
  /**
   * Get model information
   */
  public getModel(modelId: string): ModelInfo | undefined {
    return this.models.get(modelId);
  }
  
  /**
   * Check if a model exists
   */
  public modelExists(modelId: string): boolean {
    return this.models.has(modelId);
  }
  
  /**
   * Get all models
   */
  public getAllModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }
  
  /**
   * Get models by provider, sorted by release date (newest first)
   */
  public getModelsByProvider(provider: string): ModelInfo[] {
    return Array.from(this.models.values())
      .filter(model => model.provider === provider)
      .sort((a, b) => {
        // Models with release dates come first, sorted newest to oldest
        if (a.releaseDate && b.releaseDate) {
          return b.releaseDate.localeCompare(a.releaseDate);
        }
        if (a.releaseDate) return -1;
        if (b.releaseDate) return 1;
        // If no release dates, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
  }
  
  /**
   * Get models by type
   */
  public getModelsByType(type: 'chat' | 'completion' | 'image'): ModelInfo[] {
    return Array.from(this.models.values())
      .filter(model => model.type === type)
      .sort((a, b) => {
        // Models with release dates come first, sorted newest to oldest
        if (a.releaseDate && b.releaseDate) {
          return b.releaseDate.localeCompare(a.releaseDate);
        }
        if (a.releaseDate) return -1;
        if (b.releaseDate) return 1;
        // If no release dates, sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
  }
  
  /**
   * Get provider for a model
   */
  public getProvider(modelId: string): string | undefined {
    const model = this.models.get(modelId);
    return model?.provider;
  }
  
  /**
   * Check if model is an image model
   */
  public isImageModel(modelId: string): boolean {
    const model = this.models.get(modelId);
    return model?.type === 'image';
  }
  
  /**
   * Get model capabilities
   */
  public getCapabilities(modelId: string): ModelCapabilities | undefined {
    const model = this.models.get(modelId);
    return model?.capabilities;
  }
  
  /**
   * Calculate cost for a request
   */
  public calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = this.models.get(modelId);
    if (!model?.pricing) return 0;
    
    const inputCost = (inputTokens / 1000) * model.pricing.inputCostPer1kTokens;
    const outputCost = (outputTokens / 1000) * model.pricing.outputCostPer1kTokens;
    
    return inputCost + outputCost;
  }
}

export default ModelRegistry;

