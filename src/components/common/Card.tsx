import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  extra?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, extra }) => {
  return (
    <div className={`bg-white rounded-card card-shadow p-6 ${className}`}>
      {(title || extra) && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
