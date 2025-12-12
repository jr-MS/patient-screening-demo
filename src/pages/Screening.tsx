import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { ScreeningResultDisplayWithPDF } from '../components/Screening/ScreeningResultDisplayWithPDF';
import { AgentProgress } from '../components/Chat/AgentProgress';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PDFViewer } from '../components/Screening/PDFViewer';
import { convertToProxyUrl } from '../utils/pdfProxy';
import { useContentUnderstanding } from '../hooks/useContentUnderstanding';
import { transformCUResultToScreeningResult } from '../data/cuTransformer';

type ScreeningState = 'upload' | 'processing' | 'cu-result';

export const Screening: React.FC = () => {
  const [state, setState] = useState<ScreeningState>('upload');
  const demoPdfUrl = import.meta.env.VITE_DEMO_PDF_URL || '';
  const [pdfUrl, setPdfUrl] = useState(demoPdfUrl);
  const { 
    error: cuError,
    result: cuResult,
    agentSteps: cuSteps,
    startAnalysis: startCUAnalysis
  } = useContentUnderstanding();

  // Handle Content Understanding result
  useEffect(() => {
    if (cuResult) {
      setState('cu-result');
    }
  }, [cuResult]);
  
  const handleUseDemo = () => {
    // Use the single demoPdfUrl constant defined above
    setPdfUrl(demoPdfUrl);
  };
  
  const handleStartAnalysis = async () => {
    if (!pdfUrl) {
      alert('请先选择或使用示例PDF');
      return;
    }
    setState('processing');
    await startCUAnalysis(pdfUrl);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header
        title="👤 Content Understanding 文档分析"
        subtitle="使用 AI 提取和分析 PDF 文档"
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        {state === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <div className="space-y-4">
                <p className="text-text-secondary">已加载示例 PDF，直接点击开始进行 Content Understanding 分析。</p>
                <div className="h-[32rem] bg-gray-50 rounded border border-border">
                  <PDFViewer pdfUrl={convertToProxyUrl(pdfUrl)} />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={handleUseDemo}
                  >
                    重新加载示例 PDF
                  </Button>
                  <Button
                    variant="primary"
                    size="large"
                    icon="🚀"
                    onClick={handleStartAnalysis}
                  >
                    开始 Content Understanding 分析
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {state === 'processing' && (
          <div className="max-w-4xl mx-auto">
            <Card title="⏳ 正在分析患者病历...">
              <AgentProgress steps={cuSteps} />
              {cuError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  <strong>错误:</strong> {cuError}
                </div>
              )}
            </Card>
          </div>
        )}

        {state === 'cu-result' && cuResult && (
          <div className="max-w-7xl mx-auto">
            <ScreeningResultDisplayWithPDF
              result={transformCUResultToScreeningResult(cuResult)}
              pdfUrl={pdfUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
};
