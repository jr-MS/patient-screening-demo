// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentSteps?: AgentStep[];
  isLoading?: boolean;
}

// Agent步骤
export interface AgentStep {
  agent: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message: string;
  delay: number;
}

// Content Understanding 来源信息
export interface SourceLocation {
  page: number;
  boundingBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  text: string;
  spans?: Array<{
    offset: number;
    length: number;
  }>;
}

// 筛查指标
export interface ScreeningIndicator {
  id: string;
  name: string;
  value: string;
  status: 'pass' | 'warning' | 'fail';
  confidence?: number;
  rule?: string;                    // Screening rule for this indicator
  context?: string;                 // Original text context from document
  validation?: {                     // AI validation result
    status: 'pass' | 'warning' | 'fail';
    reason: string;
  };
  criteria: string;
  highlightRange: {
    start: number;
    end: number;
  };
  note?: string;
  sourceLocations?: SourceLocation[];
}

// 筛查结果
export interface ScreeningResult {
  patientId: string;
  indicators: ScreeningIndicator[];
  summary: {
    passCount: number;
    totalCount: number;
    recommendation: string;
    concerns: string[];
  };
}

// 策略推荐表行
export interface StrategyTableRow {
  country: string;
  requireLocalPatients: boolean;
  plannedRecruitment: string;
  patientPool: string;
  prevalence: string;
  clinicalDesign: string;
  enrollmentRate: string;
  costPerSubject: string;
  totalCost: string;
  indTimeline: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceSource: string;
}

// Fake响应接口
export interface FakeResponse {
  id: string;
  trigger: string;
  agentSteps: AgentStep[];
  response: string;
  sourceImage?: string;  // Optional source image path
  targetImage?: string;  // Optional result image path
}

// 预设Prompt
export interface PresetPrompt {
  id: string;
  icon: string;
  label: string;
  query: string;
  action?: string;
}
