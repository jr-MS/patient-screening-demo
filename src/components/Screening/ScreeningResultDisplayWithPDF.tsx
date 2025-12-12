import React, { useState } from 'react';
import { ScreeningResult, SourceLocation } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { IndicatorList } from './IndicatorList';
import { PDFViewer } from './PDFViewer';
import { convertToProxyUrl } from '../../utils/pdfProxy';

interface ScreeningResultDisplayWithPDFProps {
  result: ScreeningResult;
  pdfUrl: string;
}

export const ScreeningResultDisplayWithPDF: React.FC<ScreeningResultDisplayWithPDFProps> = ({
  result,
  pdfUrl
}) => {
  const [highlightLocations, setHighlightLocations] = useState<SourceLocation[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [validations, setValidations] = useState<{ [key: string]: any }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});
  const [manualDecisions, setManualDecisions] = useState<{ [key: string]: 'pass' | 'fail' | null }>({});
  
  const handleIndicatorClick = (indicator: any) => {
    if (indicator.sourceLocations && indicator.sourceLocations.length > 0) {
      setHighlightLocations(indicator.sourceLocations);
      // Auto-navigate to the first source location's page
      const firstPage = indicator.sourceLocations[0].page;
      if (firstPage) {
        setCurrentPage(firstPage);
      }
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const getOverallStatus = () => {
    const hasWarnings = result.indicators.some(ind => ind.status === 'warning');
    if (hasWarnings) {
      return { icon: '⚠️', text: '有需要人工审核的信息', type: 'warning' as const };
    }
    
    return { icon: '✅', text: '没有需要人工审核的信息', type: 'success' as const };
  };
  
  const status = getOverallStatus();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Content Understanding 分析结果</h2>
          <Badge type={status.type}>{status.icon} {status.text}</Badge>
        </div>
      </Card>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Indicators */}
        <Card title="📋 提取的字段">
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
        
        {/* Right: PDF Viewer */}
        <Card title="📄 原始文档">
          <div className="h-[85vh] bg-gray-50 rounded border border-border">
            <PDFViewer
              pdfUrl={convertToProxyUrl(pdfUrl)}
              highlightLocations={highlightLocations}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </Card>
      </div>
      
      {/* Summary */}
      <Card title="📊 提取总结">
        <div className="space-y-6">
          {/* AI审核统计 */}
          <div>
            <div className="font-medium text-text-primary mb-3 text-lg">🤖 AI 审核结果</div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {Object.values(validations).filter((v: any) => v?.status === 'pass').length}
                </div>
                <div className="text-sm text-green-600">✅ 通过</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {Object.values(validations).filter((v: any) => v?.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">⚠️ 需人工审核</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">
                  {Object.values(validations).filter((v: any) => v?.status === 'fail').length}
                </div>
                <div className="text-sm text-red-600">❌ 不通过</div>
              </div>
            </div>
            
            {/* 详细列表 */}
            <div className="space-y-2 text-sm">
              {Object.values(validations).filter((v: any) => v?.status === 'pass').length > 0 && (
                <div>
                  <span className="font-medium text-green-700">通过的指标: </span>
                  <span className="text-text-secondary">
                    {result.indicators.filter(ind => validations[ind.id]?.status === 'pass').map(ind => ind.name).join('、')}
                  </span>
                </div>
              )}
              {Object.values(validations).filter((v: any) => v?.status === 'warning').length > 0 && (
                <div>
                  <span className="font-medium text-yellow-700">需人工审核的指标: </span>
                  <span className="text-text-secondary">
                    {result.indicators.filter(ind => validations[ind.id]?.status === 'warning').map(ind => ind.name).join('、')}
                  </span>
                </div>
              )}
              {Object.values(validations).filter((v: any) => v?.status === 'fail').length > 0 && (
                <div>
                  <span className="font-medium text-red-700">不通过的指标: </span>
                  <span className="text-text-secondary">
                    {result.indicators.filter(ind => validations[ind.id]?.status === 'fail').map(ind => ind.name).join('、')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 人工反馈统计 */}
          {Object.keys(feedback).length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="font-medium text-text-primary mb-3 text-lg">👤 人工反馈</div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {Object.values(feedback).filter(f => f === 'like').length}
                  </div>
                  <div className="text-sm text-green-600">👍 AI 判断准确</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {Object.values(feedback).filter(f => f === 'dislike').length}
                  </div>
                  <div className="text-sm text-red-600">👎 AI 判断不准确</div>
                </div>
              </div>
            </div>
          )}
          
          {/* 最终结果 */}
          {(Object.keys(feedback).length > 0 || Object.keys(manualDecisions).length > 0) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="font-medium text-text-primary mb-3 text-lg">📋 最终结果（结合人工和AI）</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {(() => {
                      let finalPass = 0;
                      Object.entries(validations).forEach(([id, v]: [string, any]) => {
                        if (v?.status === 'warning') {
                          // 低置信度项：看人工决策
                          if (manualDecisions[id] === 'pass') finalPass++;
                        } else if (v?.status === 'pass') {
                          // AI判断通过：除非人工说不准确
                          if (feedback[id] !== 'dislike') finalPass++;
                        } else if (v?.status === 'fail') {
                          // AI判断不通过：但人工说准确（意味着应该通过）
                          if (feedback[id] === 'like') finalPass++;
                        }
                      });
                      return finalPass;
                    })()}
                  </div>
                  <div className="text-sm text-blue-600">✅ 最终通过</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {(() => {
                      let finalFail = 0;
                      Object.entries(validations).forEach(([id, v]: [string, any]) => {
                        if (v?.status === 'warning') {
                          // 低置信度项：看人工决策
                          if (manualDecisions[id] === 'fail') finalFail++;
                        } else if (v?.status === 'pass') {
                          // AI判断通过：但人工说不准确（意味着不应该通过）
                          if (feedback[id] === 'dislike') finalFail++;
                        } else if (v?.status === 'fail') {
                          // AI判断不通过：除非人工说准确
                          if (feedback[id] !== 'like') finalFail++;
                        }
                      });
                      return finalFail;
                    })()}
                  </div>
                  <div className="text-sm text-red-600">❌ 最终不通过</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between">
        <div className="space-x-3">
          <Button variant="outline" icon="🔄">
            重新分析
          </Button>
        </div>
        <div className="space-x-3">
          <Button variant="secondary" icon="📥">
            导出结果
          </Button>
          <Button variant="primary" icon="✅">
            确认并继续
          </Button>
        </div>
      </div>
    </div>
  );
};
