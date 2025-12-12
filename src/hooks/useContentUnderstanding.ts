import { useState, useCallback, useRef } from 'react';
import { AgentStep } from '../types';
import { delay } from '../utils/delay';

export interface ContentUnderstandingConfig {
  subscriptionKey: string;
  endpoint: string;
  analyzerId: string;
  apiVersion: string;
}

export interface AnalyzerField {
  fieldName?: string;
  fieldValue?: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  confidence?: number;
  spans?: Array<{
    offset: number;
    length: number;
  }>;
  source?:
    | string
    | Array<{
        page?: number;
        boundingBox?: {
          x: number;
          y: number;
          w: number;
          h: number;
        };
        text?: string;
      }>;
}

export interface ContentUnderstandingResult {
  id?: string;
  status?: string;
  result?: {
    analyzerId?: string;
    apiVersion?: string;
    createdAt?: string;
    contents?: Array<{
      kind?: string;
      mimeType?: string;
      markdown?: string;
      startPageNumber?: number;
      endPageNumber?: number;
      fields?: {
        [key: string]: AnalyzerField;
      };
      pages?: Array<{
        pageNumber: number;
        width: number;
        height: number;
      }>;
    }>;
  };
  contents?: Array<{
    fields?: {
      [key: string]: AnalyzerField;
    };
    markdown?: string;
  }>;
  analyzedDocument?: {
    fields?: {
      [key: string]: AnalyzerField;
    };
    markdown?: string;
  };
  fields?: {
    [key: string]: AnalyzerField;
  };
}

const CONTENT_UNDERSTANDING_CONFIG: ContentUnderstandingConfig = {
  subscriptionKey: import.meta.env.VITE_CU_SUBSCRIPTION_KEY,
  endpoint: import.meta.env.VITE_CU_ENDPOINT,
  analyzerId: import.meta.env.VITE_CU_ANALYZER_ID || 'prefilter',
  apiVersion: import.meta.env.VITE_CU_API_VERSION || '2025-11-01',
};

export interface UseContentUnderstandingReturn {
  loading: boolean;
  error: string | null;
  result: ContentUnderstandingResult | null;
  analyzerJobId: string | null;
  agentSteps: AgentStep[];
  startAnalysis: (documentUrl: string) => Promise<void>;
  reset: () => void;
}

export const useContentUnderstanding = (): UseContentUnderstandingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentUnderstandingResult | null>(null);
  const [analyzerJobId, setAnalyzerJobId] = useState<string | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnalysis = useCallback(async (documentUrl: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalyzerJobId(null);
    setAgentSteps([]);

    const steps: AgentStep[] = [
      { agent: '初始化分析器', status: 'pending', message: '准备文档分析...', delay: 500 },
      { agent: '提交分析任务', status: 'pending', message: '将文档发送到Content Understanding...', delay: 1000 },
      { agent: '等待处理', status: 'pending', message: '处理中，请稍候...', delay: 2000 },
    ];

    setAgentSteps(steps);

    try {
      if (!CONTENT_UNDERSTANDING_CONFIG.endpoint || !CONTENT_UNDERSTANDING_CONFIG.subscriptionKey) {
        throw new Error('Content Understanding 未配置：请在 .env 中设置 VITE_CU_ENDPOINT 与 VITE_CU_SUBSCRIPTION_KEY');
      }

      // Step 1: Initialize
      setAgentSteps(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], status: 'loading' };
        return updated;
      });
      await delay(steps[0].delay);
      setAgentSteps(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], status: 'success' };
        return updated;
      });

      // Step 2: Submit analysis job
      setAgentSteps(prev => {
        const updated = [...prev];
        updated[1] = { ...updated[1], status: 'loading' };
        return updated;
      });

      const submitResponse = await fetch(
        `${CONTENT_UNDERSTANDING_CONFIG.endpoint}/contentunderstanding/analyzers/${CONTENT_UNDERSTANDING_CONFIG.analyzerId}:analyze?api-version=${CONTENT_UNDERSTANDING_CONFIG.apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': CONTENT_UNDERSTANDING_CONFIG.subscriptionKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: [
              {
                url: documentUrl,
              },
            ],
          }),
        }
      );

      if (!submitResponse.ok) {
        throw new Error(`分析提交失败: ${submitResponse.statusText}`);
      }

      const submitData = await submitResponse.json();

      // Content Understanding returns an analyzer job identifier as `id`.
      // Fallbacks added for older/alternative shapes.
      const jobId =
        submitData.id ||
        submitData.jobId ||
        submitData.result?.id ||
        submitData.result?.jobId ||
        submitData.result?.[0]?.id ||
        submitData.result?.[0]?.jobId;

      if (!jobId) {
        const debugKeys = Object.keys(submitData || {}).join(', ');
        throw new Error(`无法获取分析任务ID，响应字段: ${debugKeys || '空响应'}`);
      }

      setAnalyzerJobId(jobId);
      await delay(steps[1].delay);
      setAgentSteps(prev => {
        const updated = [...prev];
        updated[1] = { ...updated[1], status: 'success' };
        return updated;
      });

      // Step 3: Poll for results
      setAgentSteps(prev => {
        const updated = [...prev];
        updated[2] = { ...updated[2], status: 'loading' };
        return updated;
      });

      let finalResult: ContentUnderstandingResult | null = null;
      
      let pollCount = 0;
      const maxPolls = 30; // 30 * 3 = 90 seconds max

      const pollForResults = async () => {
        while (pollCount < maxPolls) {
          try {
            const resultResponse = await fetch(
              `${CONTENT_UNDERSTANDING_CONFIG.endpoint}/contentunderstanding/analyzerResults/${jobId}?api-version=${CONTENT_UNDERSTANDING_CONFIG.apiVersion}`,
              {
                method: 'GET',
                headers: {
                  'Ocp-Apim-Subscription-Key': CONTENT_UNDERSTANDING_CONFIG.subscriptionKey,
                },
              }
            );

            if (!resultResponse.ok) {
              throw new Error(`获取结果失败: ${resultResponse.statusText}`);
            }

            const resultData = await resultResponse.json();

            // Extract result object (could be at resultData.result or resultData itself)
            const resultObj = resultData.result || resultData;
            
            // Log polling progress
            console.log(`轮询 #${pollCount + 1}: status=${resultData.status}, contents.length=${resultObj.contents?.length || 0}`);
            
            // Check if analysis is complete: contents must have data (don't require status 'succeeded')
            const hasContents = resultObj.contents && Array.isArray(resultObj.contents) && resultObj.contents.length > 0;
            
            if (hasContents) {
              finalResult = resultObj;
              setResult(finalResult);
              // Expose raw result for debugging in browser console.
              (window as any).__cuDebug = finalResult;
              console.log('CU result raw ===>', finalResult);
              setAgentSteps(prev => {
                const updated = [...prev];
                updated[2] = { ...updated[2], status: 'success', message: '分析完成！' };
                return updated;
              });
              break;
            }

            if (resultData.status === 'failed') {
              throw new Error('分析任务失败');
            }

            // Wait 3 seconds before next poll
            await delay(3000);
            pollCount++;
          } catch (err) {
            throw err;
          }
        }

        if (pollCount >= maxPolls && !finalResult) {
          throw new Error('分析超时，请重试');
        }
      };

      await pollForResults();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      setAgentSteps(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = { ...updated[lastIdx], status: 'error', message: errorMessage };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setLoading(false);
    setError(null);
    setResult(null);
    setAnalyzerJobId(null);
    setAgentSteps([]);
  }, []);

  return {
    loading,
    error,
    result,
    analyzerJobId,
    agentSteps,
    startAnalysis,
    reset,
  };
};
