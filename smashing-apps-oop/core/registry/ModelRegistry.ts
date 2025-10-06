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
    // OpenAI Models
    this.registerModel({
      id: 'gpt-4o',
      provider: 'openai',
      name: 'GPT-4o',
      description: 'Most capable GPT-4 model with vision',
      type: 'chat',
      capabilities: {
        maxTokens: 4096,
        supportsImages: true,
        supportsFunctions: true,
        supportsStreaming: true,
        contextWindow: 128000
      },
      pricing: {
        inputCostPer1kTokens: 0.005,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      }
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
      }
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
      }
    });
    
    // Anthropic Models
    this.registerModel({
      id: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      name: 'Claude Sonnet 4',
      description: 'Latest Claude model with enhanced capabilities',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
        currency: 'USD'
      }
    });
    
    this.registerModel({
      id: 'claude-opus-4-20250514',
      provider: 'anthropic',
      name: 'Claude Opus 4',
      description: 'Most capable Claude model',
      type: 'chat',
      capabilities: {
        maxTokens: 8192,
        supportsImages: true,
        supportsFunctions: false,
        supportsStreaming: true,
        contextWindow: 200000
      },
      pricing: {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.075,
        currency: 'USD'
      }
    });
    
    // Google Gemini Models
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
      }
    });
    
    this.registerModel({
      id: 'gemini-1.5-pro',
      provider: 'gemini',
      name: 'Gemini 1.5 Pro',
      description: 'Advanced Gemini model',
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
      }
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
   * Get models by provider
   */
  public getModelsByProvider(provider: string): ModelInfo[] {
    return Array.from(this.models.values())
      .filter(model => model.provider === provider);
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

