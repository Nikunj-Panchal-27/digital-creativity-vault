"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

export interface UseEditorReturn {
  canvas: fabric.Canvas | null;
  initCanvas: (el: HTMLCanvasElement, container: HTMLDivElement) => (() => void);
  addRectangle: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addStar: () => void;
  addHexagon: () => void;
  addHeading: () => void;
  addSubheading: () => void;
  addBodyText: () => void;
  addCustomText: (text: string) => void;
  addSvgIcon: (svg: string, color?: string) => void;
  updateBackground: (fill: string) => void;
  loadTemplate: (objects: any[]) => void;
  loadProjectJSON: (json: string) => void;
  getProjectJSON: () => string;
  exportDesign: (options: { format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'webp'; quality?: number; transparent?: boolean; name?: string }) => void;
  addImage: (url: string) => void;
  deleteSelected: () => void;
  activeObject: fabric.Object | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateActiveObject: (properties: any) => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  fitToScreen: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo100: () => void;
  config: { width: number; height: number; type: string };
}

export function useEditor(initialConfig?: { width?: number, height?: number, type?: string }): UseEditorReturn {
  const config = {
    width: initialConfig?.width || 1080,
    height: initialConfig?.height || 1080,
    type: initialConfig?.type || 'Custom'
  };
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  
  // History State
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Flag to prevent recursive saves during undo/redo
  const isHistoryModifying = useRef(false);

  const saveHistory = useCallback(() => {
    if (isHistoryModifying.current || !canvasRef.current) return;
    
    const canvasJSON = JSON.stringify(canvasRef.current.toJSON(['id']));
    
    // Truncate future history if we made a new change after an undo
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(canvasJSON);
    historyIndexRef.current += 1;
    
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const workarea = canvas.getObjects().find((obj: any) => obj.id === 'workarea');
    if (!workarea) return;

    const padding = 100;
    const scaleX = (container.clientWidth - padding) / workarea.width!;
    const scaleY = (container.clientHeight - padding) / workarea.height!;
    const zoom = Math.min(scaleX, scaleY);

    const vpt = canvas.viewportTransform!;
    vpt[0] = zoom; // scaleX
    vpt[3] = zoom; // scaleY
    vpt[4] = (container.clientWidth - workarea.width! * zoom) / 2; // panX
    vpt[5] = (container.clientHeight - workarea.height! * zoom) / 2; // panY

    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let zoom = canvas.getZoom() * 1.1;
    if (zoom > 20) zoom = 20;
    canvas.zoomToPoint({ x: canvas.getWidth() / 2, y: canvas.getHeight() / 2 }, zoom);
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let zoom = canvas.getZoom() / 1.1;
    if (zoom < 0.05) zoom = 0.05;
    canvas.zoomToPoint({ x: canvas.getWidth() / 2, y: canvas.getHeight() / 2 }, zoom);
  }, []);

  const zoomTo100 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.zoomToPoint({ x: canvas.getWidth() / 2, y: canvas.getHeight() / 2 }, 1);
  }, []);

  const initCanvas = useCallback((el: HTMLCanvasElement, container: HTMLDivElement) => {
    if (canvasRef.current) {
      try {
        canvasRef.current.dispose();
      } catch (e) {}
    }
    
    containerRef.current = container;
    const initialWidth = container.clientWidth;
    const initialHeight = container.clientHeight;

    const canvas = new fabric.Canvas(el, {
      width: initialWidth,
      height: initialHeight,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    // --- Workarea (Artboard) Setup ---
    const workarea = new fabric.Rect({
      left: 0,
      top: 0,
      width: config.width,
      height: config.height,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      id: 'workarea',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.1)',
        blur: 20,
        offsetX: 0,
        offsetY: 10
      })
    } as any);

    canvas.add(workarea);
    canvas.sendToBack(workarea);

    // Initial Fit to Screen
    setTimeout(() => {
      fitToScreen();
    }, 50);

    // --- Clip objects outside workarea (Optional, disabled so objects can exist in the workspace) ---
    /*
    canvas.clipPath = new fabric.Rect({
      left: workarea.left, top: workarea.top, width: workarea.width, height: workarea.height, absolutePositioned: true
    });
    */

    // --- Event Listeners ---
    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));
    
    canvas.on('object:modified', saveHistory);
    canvas.on('object:added', (e) => {
      if ((e.target as any).id !== 'workarea') saveHistory();
    });
    canvas.on('object:removed', saveHistory);

    // Zoom Mechanics
    canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e;
      if (evt.ctrlKey || evt.metaKey) {
        evt.preventDefault();
        evt.stopPropagation();
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** evt.deltaY;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.05) zoom = 0.05;
        canvas.zoomToPoint({ x: evt.offsetX, y: evt.offsetY }, zoom);
      } else {
        // Allow pan with wheel
        const vpt = canvas.viewportTransform!;
        vpt[4] -= evt.deltaX;
        vpt[5] -= evt.deltaY;
        canvas.requestRenderAll();
      }
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey || evt.button === 1 || (evt as any).code === 'Space') {
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });

    canvas.on('mouse:up', () => {
      canvas.setViewportTransform(canvas.viewportTransform!);
      isDragging = false;
      canvas.selection = true;
    });

    // Grid / Object Snapping
    const SNAP_GRID = 20;
    canvas.on('object:moving', (options) => {
      const target = options.target;
      if (!target) return;
      
      // Center Snap
      const workareaCenterX = config.width / 2;
      const workareaCenterY = config.height / 2;
      const objCenterX = target.left! + (target.width! * target.scaleX!) / 2;
      const objCenterY = target.top! + (target.height! * target.scaleY!) / 2;

      if (Math.abs(objCenterX - workareaCenterX) < 10) {
        target.left = workareaCenterX - (target.width! * target.scaleX!) / 2;
      }
      if (Math.abs(objCenterY - workareaCenterY) < 10) {
        target.top = workareaCenterY - (target.height! * target.scaleY!) / 2;
      }
    });

    isHistoryModifying.current = true;
    setTimeout(() => {
      isHistoryModifying.current = false;
      saveHistory();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.setWidth(containerRef.current.clientWidth);
        canvasRef.current.setHeight(containerRef.current.clientHeight);
        canvasRef.current.renderAll();
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      try {
        canvas.dispose();
      } catch (error) {}
    };
  }, [saveHistory, fitToScreen, config]);

  const getWorkareaCenter = () => {
    return { x: config.width / 2, y: config.height / 2 };
  };

  const addRectangle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const rect = new fabric.Rect({
      left: center.x - 50,
      top: center.y - 50,
      width: 100,
      height: 100,
      fill: '#4F46E5',
      rx: 8, ry: 8,
      id: uuidv4(),
    } as any);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, [config]);

  const addCircle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const circle = new fabric.Circle({
      left: center.x - 50,
      top: center.y - 50,
      radius: 50,
      fill: '#EC4899',
      id: uuidv4(),
    } as any);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }, [config]);

  const addTriangle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const triangle = new fabric.Triangle({
      left: center.x - 50,
      top: center.y - 50,
      width: 100,
      height: 100,
      fill: '#10B981', // Emerald 500
      id: uuidv4(),
    } as any);
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
  }, [config]);

  const addStar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    
    // Create a 5-point star polygon
    const points = [
      { x: 50, y: 0 },
      { x: 61, y: 35 },
      { x: 98, y: 35 },
      { x: 68, y: 57 },
      { x: 79, y: 91 },
      { x: 50, y: 70 },
      { x: 21, y: 91 },
      { x: 32, y: 57 },
      { x: 2, y: 35 },
      { x: 39, y: 35 }
    ];
    
    const star = new fabric.Polygon(points, {
      left: center.x - 50,
      top: center.y - 45.5, // 91/2
      fill: '#F59E0B', // Amber 500
      id: uuidv4(),
    } as any);
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
  }, [config]);

  const addHexagon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 25 },
      { x: 100, y: 75 },
      { x: 50, y: 100 },
      { x: 0, y: 75 },
      { x: 0, y: 25 }
    ];
    
    const hexagon = new fabric.Polygon(points, {
      left: center.x - 50,
      top: center.y - 50,
      fill: '#8B5CF6', // Violet 500
      id: uuidv4(),
    } as any);
    canvas.add(hexagon);
    canvas.setActiveObject(hexagon);
    canvas.renderAll();
  }, [config]);

  const addHeading = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const text = new fabric.IText('Add a heading', {
      left: center.x - 150,
      top: center.y - 20,
      fontFamily: 'Poppins',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#18181B',
      id: uuidv4(),
    } as any);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [config]);

  const addSubheading = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const text = new fabric.IText('Add a subheading', {
      left: center.x - 120,
      top: center.y - 15,
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: '600',
      fill: '#18181B',
      id: uuidv4(),
    } as any);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [config]);

  const addBodyText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const text = new fabric.IText('Add a little bit of body text', {
      left: center.x - 100,
      top: center.y - 10,
      fontFamily: 'Poppins',
      fontSize: 18,
      fontWeight: 'normal',
      fill: '#18181B',
      id: uuidv4(),
    } as any);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [config]);

  const addCustomText = useCallback((content: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    const text = new fabric.IText(content, {
      left: center.x - 150,
      top: center.y - 20,
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: 'bold',
      fill: '#4F46E5',
      id: uuidv4(),
    } as any);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [config]);

  const addSvgIcon = useCallback((svgString: string, color = '#18181B') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    
    fabric.loadSVGFromString(svgString, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({
        left: center.x - 40,
        top: center.y - 40,
        id: uuidv4(),
        fill: color
      } as any);
      
      // Attempt to change fill of sub-paths if group
      if (obj.type === 'group' && (obj as any)._objects) {
        (obj as any)._objects.forEach((path: any) => path.set('fill', color));
      }
      
      obj.scaleToWidth(80);
      obj.scaleToHeight(80);
      
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
    });
  }, [config]);

  const updateBackground = useCallback((fill: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const workarea = canvas.getObjects().find((obj: any) => obj.id === 'workarea');
    if (workarea) {
      workarea.set('fill', fill);
      canvas.renderAll();
      saveHistory();
    }
  }, [saveHistory]);

  const loadTemplate = useCallback((objects: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Clear existing
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    objects.forEach(obj => {
      let fabricObj;
      if (obj.type === 'text') {
        fabricObj = new fabric.IText(obj.text || 'Text', {
          left: obj.left, top: obj.top,
          fontFamily: 'Poppins', fontSize: obj.fontSize || 24,
          fontWeight: obj.fontWeight || 'normal', fill: obj.fill || '#000000',
          id: uuidv4()
        } as any);
      } else if (obj.type === 'rect') {
        fabricObj = new fabric.Rect({
          left: obj.left, top: obj.top,
          width: obj.width || 100, height: obj.height || 100,
          fill: obj.fill || '#000000',
          rx: obj.radius || 0, ry: obj.radius || 0,
          id: uuidv4()
        } as any);
      } else if (obj.type === 'circle') {
        fabricObj = new fabric.Circle({
          left: obj.left, top: obj.top,
          radius: obj.radius || 50,
          fill: obj.fill || '#000000',
          id: uuidv4()
        } as any);
      }
      if (fabricObj) canvas.add(fabricObj);
    });

    canvas.renderAll();
    saveHistory();
  }, [saveHistory]);

  const loadProjectJSON = useCallback((jsonString: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    isHistoryModifying.current = true;
    canvas.loadFromJSON(jsonString, () => {
      canvas.renderAll();
      isHistoryModifying.current = false;
      saveHistory(); // save the newly loaded project into history
    });
  }, [saveHistory]);

  const getProjectJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '{}';
    return JSON.stringify(canvas.toJSON(['id']));
  }, []);

  const exportDesign = useCallback((options: { format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'webp'; quality?: number; transparent?: boolean; name?: string }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { format, quality = 1, transparent = false, name = 'Digital_Creativity_Vault' } = options;
    
    // Save current viewport and zoom to restore later
    const vpt = [...canvas.viewportTransform!];
    const zoom = canvas.getZoom();
    const originalWidth = canvas.getWidth();
    const originalHeight = canvas.getHeight();

    // Reset viewport to 1:1 specifically around the workarea
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setWidth(config.width);
    canvas.setHeight(config.height);

    // Hide the workarea shadow for export
    const workarea = canvas.getObjects().find((obj: any) => obj.id === 'workarea');
    let originalShadow: any = null;
    let originalBg: any = null;

    if (workarea) {
      originalShadow = workarea.shadow;
      workarea.set('shadow', null as any);
      if (transparent && (format === 'png' || format === 'webp' || format === 'svg')) {
        originalBg = workarea.fill;
        workarea.set('fill', 'transparent');
      }
    }
    
    canvas.renderAll();

    try {
      if (format === 'svg') {
        const svgData = canvas.toSVG({
          viewBox: { x: 0, y: 0, width: config.width, height: config.height }
        });
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        import('jspdf').then(({ jsPDF }) => {
          const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2, left: 0, top: 0, width: config.width, height: config.height });
          const pdf = new jsPDF({
            orientation: config.width > config.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [config.width, config.height]
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, config.width, config.height);
          pdf.save(`${name}.pdf`);
        });
      } else {
        const dataUrl = canvas.toDataURL({ 
          format, 
          quality, 
          multiplier: 1,
          left: 0,
          top: 0,
          width: config.width,
          height: config.height
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${name}.${format}`;
        a.click();
      }
    } finally {
      // Restore states
      if (workarea) {
        workarea.set('shadow', originalShadow);
        if (originalBg) workarea.set('fill', originalBg);
      }
      canvas.setWidth(originalWidth);
      canvas.setHeight(originalHeight);
      canvas.setViewportTransform(vpt);
      canvas.renderAll();
    }
  }, [config]);

  const addImage = useCallback((url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = getWorkareaCenter();
    fabric.Image.fromURL(url, (img) => {
      img.set({
        left: center.x - (img.width || 200) / 4,
        top: center.y - (img.height || 200) / 4,
        id: uuidv4(),
      } as any);
      
      img.scaleToWidth(Math.min(img.width || 200, 400));
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, [config]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
    }
  }, []);

  const updateActiveObject = useCallback((properties: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(properties);
      canvas.renderAll();
      setActiveObject(Object.assign({}, activeObject)); // force react update
      saveHistory(); // manual save since programmatic modification doesn't trigger object:modified
    }
  }, [saveHistory]);

  const undo = useCallback(() => {
    if (!canUndo || !canvasRef.current) return;
    
    isHistoryModifying.current = true;
    historyIndexRef.current -= 1;
    const json = historyRef.current[historyIndexRef.current];
    
    canvasRef.current.loadFromJSON(json, () => {
      canvasRef.current?.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setActiveObject(null);
      isHistoryModifying.current = false;
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo || !canvasRef.current) return;
    
    isHistoryModifying.current = true;
    historyIndexRef.current += 1;
    const json = historyRef.current[historyIndexRef.current];
    
    canvasRef.current.loadFromJSON(json, () => {
      canvasRef.current?.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      setActiveObject(null);
      isHistoryModifying.current = false;
    });
  }, [canRedo]);

  const groupSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    (activeObject as fabric.ActiveSelection).toGroup();
    canvas.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  const ungroupSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;
    
    (activeObject as fabric.Group).toActiveSelection();
    canvas.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // don't delete if we are editing text
        const activeObject = canvasRef.current?.getActiveObject();
        if ((activeObject as any)?.isEditing) return;
        deleteSelected();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo]);

  return {
    canvas: canvasRef.current,
    initCanvas,
    addRectangle,
    addCircle,
    addTriangle,
    addStar,
    addHexagon,
    addHeading,
    addSubheading,
    addBodyText,
    addCustomText,
    addSvgIcon,
    updateBackground,
    loadTemplate,
    loadProjectJSON,
    getProjectJSON,
    exportDesign,
    addImage,
    deleteSelected,
    activeObject,
    updateActiveObject,
    undo,
    redo,
    canUndo,
    canRedo,
    groupSelected,
    ungroupSelected,
    fitToScreen,
    zoomIn,
    zoomOut,
    zoomTo100,
    config
  };
}
