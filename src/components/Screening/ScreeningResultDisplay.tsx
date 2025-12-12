import React, { useState } from 'react';
import { ScreeningResult } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { IndicatorList } from './IndicatorList';
import { RecordViewer } from './RecordViewer';

interface ScreeningResultDisplayProps {
  result: ScreeningResult;
  medicalRecord: string;
}

export const ScreeningResultDisplay: React.FC<ScreeningResultDisplayProps> = ({
  result,
  medicalRecord
}) => {
  const [highlightRanges, setHighlightRanges] = useState<Array<{ start: number; end: number }>>([]);
  const [validations, setValidations] = useState<{ [key: string]: any }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});
  const [manualDecisions, setManualDecisions] = useState<{ [key: string]: 'pass' | 'fail' | null }>({});
  
  const handleIndicatorClick = (indicator: any) => {
    setHighlightRanges([indicator.highlightRange]);
  };
  
  const getOverallStatus = () => {
    const hasFailures = result.indicators.some(ind => ind.status === 'fail');
    if (hasFailures) {
      return { icon: '❌', text: '不符合入组条件', type: 'error' as const };
    }
    
    const hasWarnings = result.indicators.some(ind => ind.status === 'warning');
    if (hasWarnings) {
      return { icon: '⚠️', text: '需人工复核', type: 'warning' as const };
    }
    
    return { icon: '✅', text: '符合入组条件', type: 'success' as const };
  };
  
  const status = getOverallStatus();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">筛查结果</h2>
          <Badge type={status.type}>{status.icon} {status.text}</Badge>
        </div>
      </Card>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Indicators */}
        <Card title="筛查指标">
          <IndicatorList
            indicators={result.indicators}
            onIndicatorClick={handleIndicatorClick}
            validations={validations}
            setValidations={setValidations}
            feedback={feedback}
            setFeedback={setFeedback}
            manualDecisions={manualDecisions}
            setManualDecisions={setManualDecisions}
          />
        </Card>
        
        {/* Right: Record Viewer */}
        <Card title="病历原文">
          <RecordViewer
            record={medicalRecord}
            highlightRanges={highlightRanges}
          />
        </Card>
      </div>
      
      {/* Summary */}
      <Card title="📊 筛查总结">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium">
              符合标准: <span className="text-primary">{result.summary.passCount}/{result.summary.totalCount}</span> 项
            </div>
          </div>
          
          {result.summary.concerns.length > 0 && (
            <div>
              <div className="font-medium text-text-primary mb-2">⚠️ 需关注问题:</div>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                {result.summary.concerns.map((concern, idx) => (
                  <li key={idx}>{concern}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-medium text-text-primary mb-1">📋 建议:</div>
            <div className="text-text-secondary">{result.summary.recommendation}</div>
          </div>
        </div>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between">
        <div className="space-x-3">
          <Button variant="outline" icon="📥">
            导出报告
          </Button>
          <Button variant="outline" icon="🔄">
            重新筛查
          </Button>
        </div>
        <div className="space-x-3">
          <Button variant="secondary" icon="📤">
            提交审核
          </Button>
          <Button variant="primary" icon="➡️">
            筛查下一位患者
          </Button>
        </div>
      </div>
    </div>
  );
};
