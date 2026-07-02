"use client";

import { useEditorContext } from './EditorContext';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Download, Home, Share2, Save, Loader2, CheckCircle2, History, ZoomIn, ZoomOut, Maximize, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ExportModal } from './ExportModal';
import { VersionHistoryModal } from './VersionHistoryModal';

export function EditorNavbar({ projectId }: { projectId?: string }) {
  const { undo, redo, canUndo, canRedo, getProjectJSON, fitToScreen, zoomIn, zoomOut, zoomTo100, config } = useEditorContext();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastSavedState = useRef<string>('');

  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      const canvasState = getProjectJSON();
      const res = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Custom Template',
          category: 'General',
          canvasState,
        })
      });
      if (res.ok) {
        alert('Saved as template successfully!');
      } else {
        alert('Failed to save template.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving template');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!projectId || projectId === 'test-project') return; // Don't auto-save if no ID or test project

    const interval = setInterval(async () => {
      const currentState = getProjectJSON();
      // Only save if it has changed and is not empty
      if (currentState !== lastSavedState.current && currentState !== '{}') {
        setIsSaving(true);
        try {
          const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canvasState: currentState })
          });
          if (res.ok) {
            lastSavedState.current = currentState;
            setLastSaved(new Date());
          }
        } catch (e) {
          console.error("Auto-save failed", e);
        } finally {
          setIsSaving(false);
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [projectId, getProjectJSON]);

  const handleShare = () => {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2"></div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={undo} 
            disabled={!canUndo}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={redo} 
            disabled={!canRedo}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{config.type || 'Untitled Design'}</span>
        <span className="text-[11px] text-zinc-500 font-medium">
          {config.width} × {config.height} px
        </span>
        
        {lastSaved && (
          <span className="text-[10px] text-zinc-400 flex items-center mt-0.5">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 mr-2">
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900">
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 text-xs font-medium px-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              Zoom
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={fitToScreen}><Maximize className="w-4 h-4 mr-2"/> Fit to Screen</DropdownMenuItem>
              <DropdownMenuItem onClick={zoomTo100}><Search className="w-4 h-4 mr-2"/> 100%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <VersionHistoryModal projectId={projectId || ''}>
          <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <History className="w-4 h-4" />
          </Button>
        </VersionHistoryModal>

        <Button 
          variant="outline" 
          className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          onClick={handleSaveTemplate}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
          Save as Template
        </Button>
        <Button 
          variant="outline" 
          className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        <ExportModal>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        </ExportModal>
      </div>
    </header>
  );
}
