import React from 'react';
import { AgentStep } from '../../types';

interface AgentProgressProps {
  steps: AgentStep[];
}

export const AgentProgress: React.FC<AgentProgressProps> = ({ steps }) => {
  const getStatusIcon = (status: AgentStep['status']) => {
    switch (status) {
      case 'success':
        return <span className="text-success text-lg checkmark">✅</span>;
      case 'loading':
        return (
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'error':
        return <span className="text-error text-lg">❌</span>;
      default:
        return <span className="text-gray-400 text-lg">⏳</span>;
    }
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
      <div className="text-sm font-medium text-text-secondary mb-3">⏳ 正在调用 Agent...</div>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex items-start space-x-3 ${
            step.status === 'loading' ? 'agent-loading' : ''
          } ${step.status === 'success' ? 'agent-success' : ''}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon(step.status)}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-text-primary">[{step.agent}]</span>
            <span className="text-sm text-text-secondary ml-2">{step.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
