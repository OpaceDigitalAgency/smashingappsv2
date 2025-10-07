interface UsageLike {
  [key: string]: any;
}

export interface NormalisedUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  reasoningTokens?: number;
}

const pickNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
  }
  return undefined;
};

const flattenContent = (content: any): string => {
  if (!content) {
    return '';
  }

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (typeof part?.text === 'string') {
          return part.text;
        }
        return '';
      })
      .join('');
  }

  if (typeof content === 'object' && typeof content.text === 'string') {
    return content.text;
  }

  return '';
};

export const extractResponseText = (response: any): string => {
  if (!response) {
    return '';
  }

  // Method 1: Standard chat completions format (GPT-3.5, GPT-4, etc.)
  const choiceContent = response?.choices?.[0]?.message?.content;
  if (typeof choiceContent === 'string' && choiceContent.trim().length > 0) {
    return choiceContent;
  }

  // Method 2: Direct content property
  if (typeof response?.content === 'string') {
    return response.content;
  }

  // Method 3: GPT-5 /v1/responses format
  const output = response?.output;
  if (Array.isArray(output)) {
    console.log('[extractResponseText] Processing GPT-5 output array:', output);

    // Look for message node with content array
    const messageNode = output.find((node: any) => node?.type === 'message');
    if (messageNode?.content && Array.isArray(messageNode.content)) {
      console.log('[extractResponseText] Found message node with content array:', messageNode.content);

      // Extract text from content array which contains objects like {type: "output_text", text: "..."}
      for (const contentItem of messageNode.content) {
        if (contentItem?.type === 'output_text' && typeof contentItem?.text === 'string') {
          console.log('[extractResponseText] Extracted text from output_text:', contentItem.text);
          return contentItem.text;
        }
        // Also handle direct text property
        if (typeof contentItem?.text === 'string') {
          console.log('[extractResponseText] Extracted text from direct text property:', contentItem.text);
          return contentItem.text;
        }
      }
      // Fallback: try to flatten the content array
      const messageText = flattenContent(messageNode.content);
      if (messageText) {
        console.log('[extractResponseText] Extracted text via flattenContent:', messageText);
        return messageText;
      }
    }

    // Look for direct text or output_text node
    const textNode = output.find((node: any) => node?.type === 'text' || node?.type === 'output_text');
    if (textNode) {
      const textValue = flattenContent(textNode?.text ?? textNode?.content);
      if (textValue) {
        return textValue;
      }
    }

    // Look for reasoning node with summary
    const reasoningNode = output.find((node: any) => node?.type === 'reasoning');
    if (reasoningNode?.summary) {
      if (Array.isArray(reasoningNode.summary)) {
        const summaryText = reasoningNode.summary.filter((item: unknown) => typeof item === 'string').join('\n');
        if (summaryText) {
          return summaryText;
        }
      } else if (typeof reasoningNode.summary === 'string') {
        return reasoningNode.summary;
      }
    }
  }

  // Method 4: Direct output_text property
  if (typeof response?.output_text === 'string') {
    return response.output_text;
  }

  if (Array.isArray(response?.output_text)) {
    return response.output_text.filter((item: unknown) => typeof item === 'string').join('');
  }

  // Method 5: Direct message content
  const messageContent = response?.message?.content;
  if (typeof messageContent === 'string') {
    return messageContent;
  }

  return '';
};

export const extractUsageInfo = (response: any): NormalisedUsage => {
  const usage: UsageLike = response?.usage || {};

  const promptTokens =
    pickNumber(usage.promptTokens, usage.prompt_tokens, usage.input_tokens) ?? 0;

  const completionTokens =
    pickNumber(usage.completionTokens, usage.completion_tokens, usage.output_tokens) ?? 0;

  const totalTokens =
    pickNumber(usage.totalTokens, usage.total_tokens, usage.prompt_tokens + usage.completion_tokens) ??
    promptTokens + completionTokens;

  const reasoningTokens = pickNumber(
    usage.reasoningTokens,
    usage.reasoning_tokens,
    usage.output_tokens_details?.reasoning_tokens
  );

  return {
    totalTokens,
    promptTokens,
    completionTokens,
    reasoningTokens
  };
};
