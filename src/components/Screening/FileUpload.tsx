import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onUseDemo: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onUseDemo }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });
  
  return (
    <Card title="📄 上传电子病历">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary bg-primary-light'
            : 'border-border hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">📁</div>
        {isDragActive ? (
          <p className="text-primary font-medium">放开文件以上传...</p>
        ) : (
          <>
            <p className="text-text-primary font-medium mb-2">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-text-secondary text-sm">
              支持格式: PDF, DOCX, TXT
            </p>
          </>
        )}
      </div>
      
      <div className="mt-6 flex items-center justify-center">
        <Button
          variant="outline"
          icon="📋"
          onClick={onUseDemo}
        >
          使用示例病历
        </Button>
      </div>
    </Card>
  );
};
