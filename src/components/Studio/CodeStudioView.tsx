import React from 'react';
import { NewCodeStudio } from './NewCodeStudio';

interface CodeStudioViewProps {
  initialModel?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export const CodeStudioView: React.FC<CodeStudioViewProps> = ({ initialModel, onBack, onClose }) => {
  return <NewCodeStudio />;
};
