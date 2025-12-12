import React, { useState, useEffect } from 'react';
import { ScreeningIndicator } from '../../types';
import { Badge } from '../common/Badge';
import { useAzureOpenAIValidation } from '../../hooks/useAzureOpenAIValidation';

interface IndicatorListProps {
  indicators: ScreeningIndicator[];
  onIndicatorClick: (indicator: ScreeningIndicator) => void;
  validations: { [key: string]: any };
  setValidations: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  feedback: { [key: string]: 'like' | 'dislike' | null };
  setFeedback: React.Dispatch<React.SetStateAction<{ [key: string]: 'like' | 'dislike' | null }>>;
  manualDecisions: { [key: string]: 'pass' | 'fail' | null };
  setManualDecisions: React.Dispatch<React.SetStateAction<{ [key: string]: 'pass' | 'fail' | null }>>;
}

export const IndicatorList: React.FC<IndicatorListProps> = ({ 
  indicators, 
  onIndicatorClick,
  validations,
  setValidations,
  feedback,
  setFeedback,
  manualDecisions,
  setManualDecisions
}) => {
  const [isAllValidated, setIsAllValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { validateIndicator } = useAzureOpenAIValidation();

  const handleFeedback = (indicatorId: string, type: 'like' | 'dislike') => {
    setFeedback(prev => ({
      ...prev,
      [indicatorId]: prev[indicatorId] === type ? null : type
    }));
  };

  const handleManualDecision = (indicatorId: string, decision: 'pass' | 'fail') => {
    setManualDecisions(prev => ({
      ...prev,
      [indicatorId]: prev[indicatorId] === decision ? null : decision
    }));
  };

  // Validate all indicators at once
  useEffect(() => {
    const validateAll = async () => {
      if (indicators.length === 0) return;

      console.log('🚀 Starting validation for indicators:', indicators.length);
      setIsValidating(true);
      const results: { [key: string]: any } = {};

      // Validate all indicators in parallel
      const validationPromises = indicators
        .filter(indicator => {
          const shouldValidate = indicator.rule && indicator.value !== '未检测到';
          console.log(`  - ${indicator.name}: rule=${!!indicator.rule}, value="${indicator.value}", shouldValidate=${shouldValidate}`);
          return shouldValidate;
        })
        .map(async (indicator) => {
          try {
            // 置信度 < 0.5 直接标记为需要人工审核
            if ((indicator.confidence ?? 0.5) < 0.5) {
              console.log(`⚠️ ${indicator.name}: 置信度低于0.5，需要人工审核`);
              results[indicator.id] = {
                status: 'warning',
                reason: '置信度较低，需要人工审核确认',
              };
              return;
            }
            
            console.log(`📋 Validating ${indicator.name}...`);
            const result = await validateIndicator({
              fieldName: indicator.id,
              displayName: indicator.name,
              extractedValue: indicator.value,
              rule: indicator.rule!,
              confidence: indicator.confidence ?? 0.5,
              context: indicator.context,
            });
            console.log(`✓ Validated ${indicator.name}:`, result);
            results[indicator.id] = result;
          } catch (error) {
            console.error(`✗ Failed to validate ${indicator.name}:`, error);
            results[indicator.id] = {
              status: 'warning',
              reason: '验证过程出错，建议人工审核',
            };
          }
        });

      console.log(`⏳ Waiting for ${validationPromises.length} validations...`);
      await Promise.all(validationPromises);
      
      console.log('✅ All validations complete:', results);
      setValidations(results);
      setIsAllValidated(true);
      setIsValidating(false);
    };

    validateAll();
  }, [indicators]);

  const getValidationStatusBadge = (validationStatus?: 'pass' | 'warning' | 'fail') => {
    switch (validationStatus) {
      case 'pass':
        return <Badge type="success">✅ 通过</Badge>;
      case 'warning':
        return <Badge type="warning">⚠️ 人工审核</Badge>;
      case 'fail':
        return <Badge type="error">❌ 不通过</Badge>;
      default:
        return null;
    }
  };

  const formatConfidence = (confidence?: number) => {
    if (typeof confidence !== 'number') return '—';
    return `${Math.round(confidence * 100)}%`;
  };

  const getConfidenceBadgeType = (confidence?: number): 'info' | 'warning' => {
    if (typeof confidence !== 'number') return 'info';
    return confidence >= 0.5 ? 'info' : 'warning';
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="animate-spin">⏳</div>
        <div className="text-text-secondary">AI 分析中，请稍候...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {indicators.map(indicator => {
        const validation = validations[indicator.id];
        const hasRule = !!indicator.rule;

        return (
          <div
            key={indicator.id}
            className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer"
            onClick={() => onIndicatorClick(indicator)}
          >
            {/* Header: Name, Value, Confidence */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-text-primary">{indicator.name}: {indicator.value}</div>
                {indicator.rule && (
                  <div className="text-xs text-text-secondary mt-1">
                    📋 规则: {indicator.rule}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge type={getConfidenceBadgeType(indicator.confidence)}>置信度 {formatConfidence(indicator.confidence)}</Badge>
                {hasRule && isAllValidated && validation && getValidationStatusBadge(validation.status)}
              </div>
            </div>

            {/* Criteria or AI Reason */}
            {hasRule && isAllValidated && validation ? (
              <div className="text-sm text-text-secondary mb-2">
                📊 {validation.reason}
              </div>
            ) : (
              <div className="text-sm text-text-secondary mb-2">
                {indicator.criteria}
              </div>
            )}

            {/* Note */}
            {indicator.note && (
              <div className="text-sm text-warning bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-2">
                💡 {indicator.note}
              </div>
            )}

            {/* Feedback buttons for AI validation or Manual decision for low confidence */}
            {hasRule && isAllValidated && validation && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                {validation.status === 'warning' ? (
                  // 低置信度需要人工决策：通过/不通过
                  <>
                    <span className="text-sm text-text-secondary">人工审核结果：</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualDecision(indicator.id, 'pass');
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                        manualDecisions[indicator.id] === 'pass'
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      ✅ 通过
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualDecision(indicator.id, 'fail');
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                        manualDecisions[indicator.id] === 'fail'
                          ? 'bg-red-100 text-red-700 border-2 border-red-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      ❌ 不通过
                    </button>
                  </>
                ) : (
                  // 高置信度AI判断：点赞/点踩反馈
                  <>
                    <span className="text-sm text-text-secondary">AI 判断是否准确？</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(indicator.id, 'like');
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                        feedback[indicator.id] === 'like'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      👍 准确
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(indicator.id, 'dislike');
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                        feedback[indicator.id] === 'dislike'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      👎 不准确
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
