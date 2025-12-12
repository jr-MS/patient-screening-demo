import React from 'react';

interface DocumentViewerProps {
  documentUrl: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentUrl }) => {
  // 使用 embed 或 object 标签显示 PDF，避免 Edge iframe 安全限制
  
  return (
    <div className="bg-white rounded border border-border overflow-hidden">
      <object
        data={documentUrl}
        type="application/pdf"
        className="w-full h-[75vh]"
      >
        <embed
          src={documentUrl}
          type="application/pdf"
          className="w-full h-[75vh]"
        />
        <div className="flex flex-col items-center justify-center h-[75vh] space-y-4">
          <div className="text-4xl">📄</div>
          <div className="text-text-secondary">无法显示 PDF</div>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            在新标签页中打开
          </a>
        </div>
      </object>
    </div>
  );
};
