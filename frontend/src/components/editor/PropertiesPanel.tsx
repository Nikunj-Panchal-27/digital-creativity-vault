"use client";

import { useEditorContext } from './EditorContext';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, BringToFront, SendToBack, AlignLeft, AlignCenter, AlignRight, Group, Ungroup, Pipette, Sparkles, Eye, EyeOff, ChevronUp, ChevronDown, Layers, Type, Image as ImageIcon, Square, Settings2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

export function PropertiesPanel() {
  const { activeObject, updateActiveObject, deleteSelected, canvas, groupSelected, ungroupSelected } = useEditorContext();
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [layers, setLayers] = useState<any[]>([]);
  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
    if (!canvas) return;
    
    const updateLayers = () => {
      const objs = canvas.getObjects().filter((obj: any) => obj.id !== 'workarea').reverse();
      setLayers([...objs]);
    };

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    
    updateLayers();

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas, forceRender]);

  const bringForward = (obj?: any) => {
    const target = obj || activeObject;
    if (!canvas || !target) return;
    canvas.bringForward(target);
    canvas.renderAll();
    setForceRender(prev => prev + 1);
  };

  const sendBackward = (obj?: any) => {
    const target = obj || activeObject;
    if (!canvas || !target) return;
    
    // Don't send behind workarea
    const objects = canvas.getObjects();
    const workareaIndex = objects.findIndex((o: any) => o.id === 'workarea');
    const targetIndex = objects.indexOf(target);
    
    if (targetIndex > workareaIndex + 1) {
      canvas.sendBackwards(target);
      canvas.renderAll();
      setForceRender(prev => prev + 1);
    }
  };

  const toggleVisibility = (obj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    obj.set('visible', !obj.visible);
    canvas?.renderAll();
    setForceRender(prev => prev + 1);
  };

  const selectLayer = (obj: any) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setActiveTab('properties');
  };

  const getLayerIcon = (type: string) => {
    if (type === 'i-text' || type === 'text') return <Type className="w-4 h-4" />;
    if (type === 'image') return <ImageIcon className="w-4 h-4" />;
    if (type === 'group' || type === 'activeSelection') return <Group className="w-4 h-4" />;
    return <Square className="w-4 h-4" />;
  };

  const getLayerName = (obj: any) => {
    if (obj.type === 'i-text' || obj.type === 'text') return obj.text?.substring(0, 15) + (obj.text?.length > 15 ? '...' : '') || 'Text';
    if (obj.type === 'image') return 'Image';
    if (obj.type === 'group') return 'Group';
    if (obj.type === 'rect') return 'Rectangle';
    if (obj.type === 'circle') return 'Circle';
    if (obj.type === 'triangle') return 'Triangle';
    if (obj.type === 'polygon') return 'Shape';
    if (obj.type === 'path') return 'Icon';
    return obj.type;
  };

  const isText = activeObject?.type === 'i-text' || activeObject?.type === 'text';
  const isImage = activeObject?.type === 'image';
  const color = (activeObject?.fill as string) || '#000000';
  const opacity = activeObject?.opacity ?? 1;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateActiveObject({ fill: e.target.value });
  };

  const handleEyedropper = async () => {
    try {
      // @ts-ignore
      if (!window.EyeDropper) {
        alert('Your browser does not support the Eyedropper API');
        return;
      }
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      updateActiveObject({ fill: result.sRGBHex });
    } catch (e) {
      console.log(e);
    }
  };

  const handleDuplicate = () => {
    if (!canvas || !activeObject) return;
    activeObject.clone((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: cloned.left! + 20,
        top: cloned.top! + 20,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  return (
    <aside className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 z-10">
      <div className="flex w-full border-b border-zinc-200 dark:border-zinc-800">
        <button 
          className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-medium ${activeTab === 'properties' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          onClick={() => setActiveTab('properties')}
        >
          <Settings2 className="w-4 h-4" /> Properties
        </button>
        <button 
          className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-medium ${activeTab === 'layers' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          onClick={() => setActiveTab('layers')}
        >
          <Layers className="w-4 h-4" /> Layers
        </button>
      </div>

      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {layers.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center mt-4">No layers found.</p>
          ) : (
            layers.map((layer, idx) => (
              <div 
                key={layer.id || idx} 
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${activeObject === layer ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                onClick={() => selectLayer(layer)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="text-zinc-500">{getLayerIcon(layer.type)}</div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate font-medium">{getLayerName(layer)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={(e) => toggleVisibility(layer, e)}>
                    {layer.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-300" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={(e) => { e.stopPropagation(); bringForward(layer); }} disabled={idx === 0}>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={(e) => { e.stopPropagation(); sendBackward(layer); }} disabled={idx === layers.length - 1}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'properties' && (
        <>
          {!activeObject ? (
            <div className="p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Canvas</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Select an object to edit its properties.</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Properties</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleDuplicate} className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={deleteSelected} className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Color Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Color</label>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={color.length === 7 ? color : '#000000'}
              onChange={handleColorChange}
              className="w-8 h-8 rounded cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
            />
            <input 
              type="text" 
              value={color}
              onChange={handleColorChange}
              className="flex-1 h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
            />
            <Button variant="ghost" size="icon" onClick={handleEyedropper} className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100" title="Eyedropper">
              <Pipette className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Opacity Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Opacity</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={opacity}
              onChange={(e) => updateActiveObject({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 w-8 text-right">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>

        <Separator className="bg-zinc-200 dark:bg-zinc-800" />

        {/* Arrange Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Arrange</label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={bringForward} className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300">
              <BringToFront className="w-4 h-4 mr-2" /> Forward
            </Button>
            <Button variant="outline" size="sm" onClick={sendBackward} className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300">
              <SendToBack className="w-4 h-4 mr-2" /> Backward
            </Button>
          </div>
        </div>

        {/* Group Section */}
        {(activeObject.type === 'activeSelection' || activeObject.type === 'group') && (
          <>
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Grouping</label>
              {activeObject.type === 'activeSelection' ? (
                <Button variant="outline" size="sm" onClick={groupSelected} className="w-full border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300">
                  <Group className="w-4 h-4 mr-2" /> Group Objects
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={ungroupSelected} className="w-full border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300">
                  <Ungroup className="w-4 h-4 mr-2" /> Ungroup Objects
                </Button>
              )}
            </div>
          </>
        )}

        {/* Text specific section */}
        {isText && (
          <>
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            
            {/* Font Family */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Font Family</label>
              <select 
                value={(activeObject as any).fontFamily || 'Poppins'} 
                onChange={(e) => updateActiveObject({ fontFamily: e.target.value })}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Font Size</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={(activeObject as any).fontSize || 16}
                  onChange={(e) => updateActiveObject({ fontSize: parseInt(e.target.value) })}
                  className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Text Alignment</label>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 ${(activeObject as any)?.textAlign === 'left' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
                  onClick={() => updateActiveObject({ textAlign: 'left' })}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 ${(activeObject as any)?.textAlign === 'center' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
                  onClick={() => updateActiveObject({ textAlign: 'center' })}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex-1 ${(activeObject as any)?.textAlign === 'right' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
                  onClick={() => updateActiveObject({ textAlign: 'right' })}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Image specific section */}
        {isImage && (
          <>
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Flip</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateActiveObject({ flipX: !activeObject.flipX })} 
                  className="flex-1 border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300"
                >
                  Flip Horizontally
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateActiveObject({ flipY: !activeObject.flipY })} 
                  className="flex-1 border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300"
                >
                  Flip Vertically
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase">AI Image Tools</label>
              <Button 
                className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:opacity-90 text-white border-0" 
                onClick={() => alert('Magic Eraser & Background Removal requires a Vision API key (e.g., fal.ai or replicate). Connect an API in settings to enable this premium feature!')}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Magic Eraser
              </Button>
            </div>
          </>
        )}
        </div>
      </>
    )}
    </>
  )}
  </aside>
  );
}
