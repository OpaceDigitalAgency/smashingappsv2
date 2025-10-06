import { useState, useEffect } from 'react';
import AICore from '../../../core/AICore';
import { Message, NormalisedResponse } from '../../../core/interfaces/IProvider';

export function useAICore() {
  const [aiCore] = useState(() => AICore.getInstance());
  const [isConfigured, setIsConfigured] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const updateStatus = () => {
      setIsConfigured(aiCore.isConfigured());
      setProviders(aiCore.getConfiguredProviders());
    };
    
    updateStatus();
    
    window.addEventListener('ai-core-settings-changed', updateStatus);
    return () => {
      window.removeEventListener('ai-core-settings-changed', updateStatus);
    };
  }, [aiCore]);
  
  const sendRequest = async (
    model: string,
    messages: Message[],
    options: any = {},
    appId: string
  ): Promise<NormalisedResponse> => {
    setLoading(true);
    try {
      const response = await aiCore.sendTextRequest(model, messages, options, appId);
      return response;
    } finally {
      setLoading(false);
    }
  };
  
  const extractContent = (response: NormalisedResponse): string => {
    return AICore.extractContent(response);
  };
  
  const extractUsage = (response: NormalisedResponse) => {
    return AICore.extractUsage(response);
  };
  
  return {
    aiCore,
    isConfigured,
    providers,
    loading,
    sendRequest,
    extractContent,
    extractUsage,
  };
}

