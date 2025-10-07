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
 *
 * SIMPLIFIED LOGIC:
 * - Count keyword matches for current use case
 * - Count keyword matches for all other use cases
 * - If another use case has MORE matches, suggest switching to it
 * - No negative keywords needed - if "food" matches Recipe Steps but not Daily Organizer, that's enough!
 */
export const validateTaskLocally = (task: string, useCase: string): ValidationResult => {
  const definition = useCaseDefinitions[useCase];
  if (!definition) {
    return { isValid: true, confidence: 0.5, reason: "No definition for use case" };
  }

  const taskLower = task.toLowerCase();

  // Count keyword matches for the current use case
  const currentMatchCount = definition.keywords.filter(word => taskLower.includes(word.toLowerCase())).length;

  // Check all other use cases to find the best match
  let bestMatchUseCase = useCase;
  let bestMatchScore = currentMatchCount;

  for (const [otherUseCase, otherDef] of Object.entries(useCaseDefinitions)) {
    if (otherUseCase === useCase) continue;

    const otherMatchCount = otherDef.keywords.filter(word =>
      taskLower.includes(word.toLowerCase())
    ).length;

    // If this use case has MORE matches than the current one, it's a better fit
    if (otherMatchCount > bestMatchScore) {
      bestMatchUseCase = otherUseCase;
      bestMatchScore = otherMatchCount;
    }
  }

  // If we found a better match (another use case has more keyword matches), suggest switching
  if (bestMatchUseCase !== useCase && bestMatchScore > 0) {
    console.log('Local validation: Mismatch detected!');
    console.log('  - Task:', task);
    console.log('  - Current use case:', useCase, '(matches:', currentMatchCount, ')');
    console.log('  - Suggested use case:', bestMatchUseCase, '(matches:', bestMatchScore, ')');

    // Confidence is based on how much better the other use case is
    const confidence = Math.min(0.9, 0.5 + (bestMatchScore - currentMatchCount) * 0.1);

    return {
      isValid: false,
      confidence: confidence,
      reason: `This task seems more like a ${useCaseDefinitions[bestMatchUseCase].label} task.`,
      suggestedUseCase: bestMatchUseCase
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
  recaptchaToken?: string | null,
  model: string = 'gpt-3.5-turbo' // Add model parameter with default
): Promise<ValidationResult> => {
  try {
    // If no model is provided or model is empty, use local validation immediately
    if (!model || model.trim() === '') {
      console.log('No AI model configured, using local validation');
      return validateTaskLocally(task, useCase);
    }

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

      // Use AI-Core to make the request with the provided model
      const response = await aiCore.sendTextRequest(
        model, // Use the model parameter instead of hardcoded gpt-3.5-turbo
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