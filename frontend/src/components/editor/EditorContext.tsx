"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useEditor, UseEditorReturn } from './useEditor';

const EditorContext = createContext<UseEditorReturn | null>(null);

export const EditorProvider = ({ children, config }: { children: ReactNode, config?: { width?: number, height?: number, type?: string } }) => {
  const editor = useEditor(config);

  return (
    <EditorContext.Provider value={editor}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
