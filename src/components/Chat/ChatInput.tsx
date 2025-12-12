import React, { useState } from 'react';
import { Button } from '../common/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '请输入您的研究问题...'
}) => {
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="border-t border-border bg-white p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="small"
            icon="📎"
            disabled={disabled}
            onClick={() => alert('文件上传功能开发中...')}
          >
            上传
          </Button>
          <Button
            variant="primary"
            size="small"
            icon="▶️"
            disabled={disabled || !input.trim()}
            onClick={handleSend}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};
