import React from 'react';
import { PresetPrompt } from '../../types';

interface PromptButtonsProps {
  prompts: PresetPrompt[];
  onSelect: (prompt: PresetPrompt) => void;
}

export const PromptButtons: React.FC<PromptButtonsProps> = ({ prompts, onSelect }) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-3">
        {prompts.map(prompt => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition-all shadow-sm hover:shadow"
          >
            <span className="text-xl">{prompt.icon}</span>
            <span className="font-medium">{prompt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
