import { useState } from 'react';

export interface ValidationResult {
  status: 'pass' | 'warning' | 'fail';
  reason: string;
}

interface ValidateParams {
  fieldName: string;
  displayName: string;
  extractedValue: string;
  rule: string;
  confidence: number;
  context?: string; // Original text context from document
}

/**
 * Hook for validating indicators using Azure OpenAI
 */
export const useAzureOpenAIValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateIndicator = async (params: ValidateParams): Promise<ValidationResult> => {
    const { fieldName, displayName, extractedValue, rule, confidence, context } = params;

    console.log('🔍 validateIndicator called with:', { fieldName, displayName, extractedValue, rule, confidence, context: context ? '✓ provided' : '✗ none' });
    setIsValidating(true);
    setValidationError(null);

    try {
      const prompt = `You are a medical screening expert. 
      
Field: ${displayName} (${fieldName})
Rule: ${rule}
Extracted Value: "${extractedValue}"
${context ? `\nOriginal Text Context (from document):\n"${context}"\n` : ''}
Confidence Score: ${Math.round(confidence * 100)}%

Please evaluate if the extracted value meets the rule. Consider:
1. Does the extracted value satisfy the rule requirements?
2. If context is provided, does the surrounding text support or contradict the extracted value?
3. Should this be flagged for manual review (e.g., ambiguous text, low confidence)?

Respond in JSON format:
{
  "status": "pass|warning|fail",
  "reason": "Brief explanation in Chinese"
}

Status explanation:
- pass: The extracted value clearly meets the rule
- warning: The extracted value might need manual review (e.g., low confidence, ambiguous value, context conflicts)
- fail: The extracted value does not meet the rule

Respond ONLY with valid JSON, no other text.`;

  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

      console.log('🔑 Environment check:', { 
        endpoint: endpoint ? '✓ set' : '✗ missing', 
        apiKey: apiKey ? '✓ set' : '✗ missing' 
      });

      if (!endpoint || !apiKey) {
        console.error('❌ Missing env vars:', { endpoint: !!endpoint, apiKey: !!apiKey });
        throw new Error('Azure OpenAI credentials not configured in .env');
      }

      console.log(`📡 Calling Azure OpenAI API at ${endpoint}...`);
      // Call Azure OpenAI REST API
      const response = await fetch(`${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a medical screening expert. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      });

      console.log(`📨 API Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(`Azure OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      console.log('📝 Raw API response:', content);

      // Parse JSON response
      let result: ValidationResult;
      try {
        result = JSON.parse(content);
        console.log('✅ Parsed result:', result);
      } catch {
        console.error('⚠️ Failed to parse OpenAI response:', content);
        result = {
          status: 'warning',
          reason: '无法解析 AI 判断结果，建议人工审核',
        };
      }

      // Validate response structure
      if (!['pass', 'warning', 'fail'].includes(result.status)) {
        result.status = 'warning';
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Validation error:', errorMsg);
      setValidationError(errorMsg);
      
      return {
        status: 'warning',
        reason: `验证过程出错: ${errorMsg}，建议人工审核`,
      };
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateIndicator,
    isValidating,
    validationError,
  };
};
