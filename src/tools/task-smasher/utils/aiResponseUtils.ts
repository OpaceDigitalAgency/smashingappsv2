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

  const choiceContent = response?.choices?.[0]?.message?.content;
  if (typeof choiceContent === 'string' && choiceContent.trim().length > 0) {
    return choiceContent;
  }

  if (typeof response?.content === 'string') {
    return response.content;
  }

  const output = response?.output;
  if (Array.isArray(output)) {
    const messageNode = output.find((node: any) => node?.type === 'message');
    const messageText = flattenContent(messageNode?.content);
    if (messageText) {
      return messageText;
    }

    const textNode = output.find((node: any) => node?.type === 'text' || node?.type === 'output_text');
    const textValue = flattenContent(textNode?.text ?? textNode?.content);
    if (textValue) {
      return textValue;
    }

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

  if (typeof response?.output_text === 'string') {
    return response.output_text;
  }

  if (Array.isArray(response?.output_text)) {
    return response.output_text.filter((item: unknown) => typeof item === 'string').join('');
  }

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
