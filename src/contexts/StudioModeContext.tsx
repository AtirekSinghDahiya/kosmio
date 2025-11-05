import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StudioMode = 'chat' | 'image' | 'video' | 'music' | 'voice';

interface StudioModeContextType {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

const StudioModeContext = createContext<StudioModeContextType | undefined>(undefined);

export const StudioModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<StudioMode>('chat');
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <StudioModeContext.Provider value={{ mode, setMode, projectId, setProjectId }}>
      {children}
    </StudioModeContext.Provider>
  );
};

export const useStudioMode = () => {
  const context = useContext(StudioModeContext);
  if (!context) {
    throw new Error('useStudioMode must be used within StudioModeProvider');
  }
  return context;
};
