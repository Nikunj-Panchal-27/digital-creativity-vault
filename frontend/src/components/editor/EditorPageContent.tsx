"use client";

import { EditorNavbar } from '@/components/editor/EditorNavbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { EditorProvider } from '@/components/editor/EditorContext';

export default function EditorPageContent({ projectId, config }: { projectId?: string, config?: { width?: number, height?: number } }) {
  return (
    <EditorProvider config={config}>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <EditorNavbar projectId={projectId} />
        <div className="flex flex-1 overflow-hidden">
          <EditorSidebar />
          <main className="flex-1 relative bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden">
            <EditorWorkspace />
          </main>
          <PropertiesPanel />
        </div>
      </div>
    </EditorProvider>
  );
}
