import { useCaseDefinitions } from './useCaseDefinitions';
import AICore from '../../../../core/AICore';

type ValidationResult = {
  isValid: boolean;
  confidence: number; // 0 to 1
  reason: string;
  suggestedUseCase?: string;
};

/**
 * Validates if the task matches the current use case using simple heuristic rules.
 * This is a fallback when OpenAI integration isn't available or enabled.
 */
export const validateTaskLocally = (task: string, useCase: string): ValidationResult => {
  const definition = useCaseDefinitions[useCase];
  if (!definition) {
    return { isValid: true, confidence: 0.5, reason: "No definition for use case" };
  }

  const taskLower = task.toLowerCase();
  
  // Check for keywords that match the use case
  const matchCount = definition.keywords.filter(word => taskLower.includes(word.toLowerCase())).length;
  const mismatchCount = definition.negativeKeywords.filter(word => taskLower.includes(word.toLowerCase())).length;
  
  // Check other use cases for better matches
  let bestMatchUseCase = useCase;
  let bestMatchScore = matchCount;
  
  for (const [otherUseCase, otherDef] of Object.entries(useCaseDefinitions)) {
    if (otherUseCase === useCase) continue;
    
    const otherMatchCount = otherDef.keywords.filter(word => 
      taskLower.includes(word.toLowerCase())
    ).length;
    
    if (otherMatchCount > bestMatchScore) {
      bestMatchUseCase = otherUseCase;
      bestMatchScore = otherMatchCount;
    }
  }
  
  // Calculate confidence based on match and mismatch counts
  // Increased weight for negative keywords to make validation more strict
  const confidence = Math.min(1, Math.max(0,
    (matchCount / (definition.keywords.length || 1)) -
    (mismatchCount * 1.5 / (definition.negativeKeywords.length || 1))
  ));
  
  // If confidence is low and we found a better match
  // Increased threshold from 0.3 to 0.4 to be more strict
  if (confidence < 0.4 && bestMatchUseCase !== useCase && bestMatchScore > 1) {
    return {
      isValid: false,
      confidence: 1 - confidence,
      reason: `This task seems more like a ${useCaseDefinitions[bestMatchUseCase].label} task.`,
      suggestedUseCase: bestMatchUseCase
    };
  }
  
  // Check specifically for negative keywords - if any are found, that's a strong signal
  if (mismatchCount > 0) {
    return {
      isValid: false,
      confidence: 0.8,
      reason: `This task contains terms that don't fit in the current category.`,
      suggestedUseCase: bestMatchUseCase !== useCase ? bestMatchUseCase : undefined
    };
  }
  
  // Task is valid for the current use case
  // Increased threshold from 0.3 to 0.4 to be more strict
  return {
    isValid: confidence >= 0.4 || bestMatchUseCase === useCase,
    confidence,
    reason: confidence < 0.4
      ? "Task doesn't seem to match the current use case."
      : "Task matches the current use case."
  };
};

/**
 * Validates the task using OpenAI API through our proxy.
 * Falls back to local validation if there are any issues.
 */
export const validateTaskWithAI = async (
  task: string,
  useCase: string,
  recaptchaToken?: string | null
): Promise<ValidationResult> => {
  try {
    const prompt = `
Task: "${task}"
Current Category: "${useCaseDefinitions[useCase]?.label || useCase}"

Determine if this task belongs in the current category. If it doesn't, suggest a better category from this list:
${Object.entries(useCaseDefinitions).map(([id, def]) => `- ${def.label}`).join('\n')}

Response format (JSON):
{
  "isValid": boolean, // true if task fits in the current category
  "confidence": number, // 0 to 1, how confident you are in this assessment
  "reason": string, // short explanation of your decision
  "suggestedCategory": string // if isValid is false, the name of a better category
}
`;

    try {
      // Get AI-Core instance
      const aiCore = AICore.getInstance();

      // Use AI-Core to make the request
      const response = await aiCore.sendTextRequest(
        'gpt-3.5-turbo',
        [
          {
            role: 'system',
            content: 'You are a strict task categorization assistant with deep knowledge of various domains. Analyze if tasks fit their assigned categories using semantic understanding rather than simple keyword matching. Be particularly vigilant about tasks that contain terms from other categories. For example, "SEO" tasks should be in Marketing, not Recipe Steps, even if they mention food. Similarly, "web design" belongs in Marketing, not Home Chores. Be strict about maintaining category boundaries to ensure tasks are properly organized. If a task contains terms that are clearly from another category, mark it as invalid with high confidence.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 500
        },
        'task-smasher'
      );

      try {
        // Extract content from AI-Core response
        const responseContent = response.choices[0]?.message?.content || '';
        const parsedResponse = JSON.parse(responseContent);
        
        // Convert suggested category name to useCase id
        let suggestedUseCase = undefined;
        if (!parsedResponse.isValid && parsedResponse.suggestedCategory) {
          for (const [id, def] of Object.entries(useCaseDefinitions)) {
            if (def.label.toLowerCase() === parsedResponse.suggestedCategory.toLowerCase()) {
              suggestedUseCase = id;
              break;
            }
          }
        }
          
          return {
            isValid: parsedResponse.isValid,
            confidence: parsedResponse.confidence,
            reason: parsedResponse.reason,
            suggestedUseCase
          };
      } catch (error) {
        console.error('Error parsing AI response:', error);
        return validateTaskLocally(task, useCase);
      }
    } catch (error) {
      // Handle rate limiting errors
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        console.warn('Rate limit exceeded for OpenAI API. Using local validation instead.');
      } else {
        console.error('Error calling OpenAI API:', error);
      }
    }
    
    // Fall back to local validation
    return validateTaskLocally(task, useCase);
  } catch (error) {
    console.error('Error in validateTaskWithAI:', error);
    return validateTaskLocally(task, useCase);
  }
};