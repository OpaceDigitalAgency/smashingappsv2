import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Tool Configuration Types
export interface ToolUseCase {
  id: string;
  label: string;
  description: string;
  icon?: LucideIcon;
  promptTemplate?: string;
}

export interface ToolCapabilities {
  ai: {
    enabled: boolean;
    defaultModel: string;
    availableModels: string[];
    systemPromptTemplate: string;
  };
  export: {
    enabled: boolean;
    formats: ('pdf' | 'excel' | 'csv' | 'json')[];
  };
  voice: {
    enabled: boolean;
  };
  dragDrop: {
    enabled: boolean;
  };
  rateLimit: {
    enabled: boolean;
    defaultLimit: number;
  };
}

export interface ToolRoutes {
  base: string;
  subRoutes?: Record<string, string>;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  routes: ToolRoutes;
  capabilities: ToolCapabilities;
  useCases: Record<string, ToolUseCase>;
  defaultUseCase: string;
  metaTags: {
    title: string;
    description: string;
    ogImage: string;
  };
}

// AI Service Types
export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  used: number;
  reset: Date;
}

// Component Props Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface PromptRunnerProps {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  onResult: (result: string) => void;
  onError: (error: Error) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  renderResult?: (result: string) => ReactNode;
  className?: string;
}

// Hook Types
export interface AIExecuteOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIExecuteResult {
  content: string;
  rateLimit: RateLimitInfo;
}

export interface UseAIReturn {
  execute: (options: AIExecuteOptions) => Promise<AIExecuteResult>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseRateLimitReturn {
  rateLimited: boolean;
  rateLimitInfo: RateLimitInfo;
  showRateLimitPopup: boolean;
  setShowRateLimitPopup: (show: boolean) => void;
  clearRateLimits: () => void;
  updateRateLimitInfo: (rateLimit: RateLimitInfo) => void;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((val: T) => T)) => void;
  remove: () => void;
}