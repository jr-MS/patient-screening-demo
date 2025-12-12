import React from 'react';
import { Message } from '../../types';
import { AgentProgress } from './AgentProgress';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatDate } from '../../utils/delay';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="message-user px-4 py-3 shadow-sm">
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs opacity-75 mt-2">
            {formatDate(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[85%]">
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div className="flex-1">
          <div className="message-ai px-4 py-3 shadow-sm">
            {message.agentSteps && message.agentSteps.length > 0 && (
              <AgentProgress steps={message.agentSteps} />
            )}
            {message.isLoading ? (
              <div className="flex items-center space-x-2 text-text-secondary">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>正在生成回复...</span>
              </div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
            <div className="text-xs text-text-secondary mt-2">
              {formatDate(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
