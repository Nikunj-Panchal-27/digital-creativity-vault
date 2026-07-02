"use client";

import { useEffect, useRef } from 'react';
import { useEditorContext } from './EditorContext';

export function EditorWorkspace() {
  const { initCanvas, addImage } = useEditorContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const cleanup = initCanvas(canvasRef.current, containerRef.current);
      if (typeof cleanup === 'function') {
        return () => (cleanup as unknown as Function)();
      }
    }
  }, [initCanvas]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-zinc-200/50 dark:bg-zinc-950"
      onDragOver={(e) => {
        e.preventDefault(); // allow drop
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const url = e.dataTransfer.getData('text/plain');
        if (url) {
          addImage(url);
        }
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
