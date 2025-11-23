import React from 'react';
import { CodeStudio } from './CodeStudio';

interface CodeStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export const CodeStudioView: React.FC<CodeStudioViewProps> = ({ initialModel, onBack, onClose }) => {
  return <CodeStudio />;
};
