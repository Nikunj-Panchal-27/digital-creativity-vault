"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorContext } from './EditorContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutTemplate, Shapes, Type, Image as ImageIcon,
  Square, Circle, Triangle, Star, Hexagon, X, Sparkles, QrCode, Palette, Loader2, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'design' | 'elements' | 'text' | 'uploads' | 'photos' | 'background' | 'brand' | 'apps' | null;

export function EditorSidebar() {
  const { addRectangle, addCircle, addTriangle, addStar, addHexagon, addHeading, addSubheading, addBodyText, addImage, addCustomText, addSvgIcon, updateBackground, loadTemplate, canvas, activeObject } = useEditorContext();
  const [activeTab, setActiveTab] = useState<Tab>('design');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrUrl, setQrUrl] = useState('https://digitalcreativity.com');
  const [magicPrompt, setMagicPrompt] = useState('');
  const [paletteContext, setPaletteContext] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [isGeneratingPalette, setIsGeneratingPalette] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<{colors: string[], fonts: any}>({ colors: [], fonts: {} });

  const handleMagicWrite = async () => {
    if (!magicPrompt) return;
    setIsGeneratingText(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: magicPrompt })
      });
      const data = await res.json();
      if (data.text) {
        addCustomText(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingText(false);
      setMagicPrompt('');
    }
  };

  const handleMagicDesign = async (type: string) => {
    setIsGeneratingDesign(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: type })
      });
      const data = await res.json();
      if (data.objects) {
        loadTemplate(data.objects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  const handleMagicPalette = async () => {
    setIsGeneratingPalette(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: paletteContext })
      });
      const data = await res.json();
      if (data.palette && data.palette.length === 4) {
        if (!canvas) return;
        
        canvas.backgroundColor = data.palette[0];
        
        const { v4: uuidv4 } = require('uuid');
        const startX = canvas.getWidth() / 2 - 100;
        const startY = canvas.getHeight() / 2;
        
        for (let i = 1; i <= 3; i++) {
          const circle = new (window as any).fabric.Circle({
            left: startX + (i * 60), top: startY, radius: 25,
            fill: data.palette[i], id: uuidv4()
          });
          canvas.add(circle);
        }
        canvas.renderAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPalette(false);
    }
  };

  const tabs = [
    { id: 'design', icon: LayoutTemplate, label: 'Design' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'photos', icon: ImageIcon, label: 'Photos' },
    { id: 'background', icon: Square, label: 'Background' },
    { id: 'brand', icon: Palette, label: 'Brand' },
    { id: 'uploads', icon: ImageIcon, label: 'Uploads' },
    { id: 'apps', icon: Sparkles, label: 'Apps' },
  ];

  const [images, setImages] = useState<any[]>([]);
  const [imageQuery, setImageQuery] = useState('nature');
  const [imagePage, setImagePage] = useState(1);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const observerTarget = useRef(null);

  const fetchImages = useCallback(async (query: string, page: number, append = false) => {
    setIsLoadingImages(true);
    try {
      const res = await fetch(`http://localhost:5000/api/images/search?q=${query}&page=${page}`);
      const data = await res.json();
      if (data.images) {
        setImages(prev => append ? [...prev, ...data.images] : data.images);
      }
    } catch (e) {
      console.error("Failed to fetch images", e);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'photos') {
      fetchImages(imageQuery, 1, false);
    } else if (activeTab === 'brand') {
      fetch('http://localhost:5000/api/brand')
        .then(res => res.json())
        .then(data => {
          if (data.brandKit) setBrandKit(data.brandKit);
        });
    }
  }, [activeTab, imageQuery, fetchImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && activeTab === 'photos' && !isLoadingImages) {
          const nextPage = imagePage + 1;
          setImagePage(nextPage);
          fetchImages(imageQuery, nextPage, true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, activeTab, isLoadingImages, imageQuery, imagePage, fetchImages]);

  const fetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`http://localhost:5000/api/templates?category=${templateCategory}&search=${templateQuery}`);
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [templateCategory, templateQuery]);

  useEffect(() => {
    if (activeTab === 'design') {
      fetchTemplates();
    }
  }, [activeTab, templateCategory, templateQuery, fetchTemplates]);

  return (
    <div className="flex h-full shrink-0 z-10 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-xl">
      <aside className="w-20 flex flex-col items-center py-4 gap-2 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-16 w-16 gap-1 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10",
              activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" : ""
            )}
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id as Tab)}
          >
            <tab.icon className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Button>
        ))}
      </aside>

      {activeTab && (
        <aside className="w-80 flex flex-col bg-white dark:bg-zinc-950 relative">
          <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 capitalize">
              {activeTab}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setActiveTab(null)} className="h-8 w-8 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
            
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search templates..."
                      className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={templateQuery}
                      onChange={(e) => setTemplateQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                    {['All', 'Instagram', 'Facebook', 'YouTube', 'Resume', 'Presentation', 'Poster', 'Banner', 'Invitation', 'Certificate', 'Business Card', 'Flyer', 'Logo', 'Thumbnail', 'CV', 'Brochure'].map(cat => (
                      <Button 
                        key={cat} 
                        variant={templateCategory === cat ? 'default' : 'outline'}
                        size="sm" 
                        className={cn("h-7 text-xs rounded-full whitespace-nowrap", templateCategory !== cat && "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-300")}
                        onClick={() => setTemplateCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>

                  {isLoadingTemplates ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
                  ) : (
                    <div className="columns-2 gap-2 space-y-2">
                      {templates.map((tpl: any) => (
                        <div 
                          key={tpl._id} 
                          className="relative group rounded-md overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800"
                          onClick={() => {
                            if (window.confirm("Loading this template will replace your current design. Continue?")) {
                              loadTemplate(tpl.canvasState);
                            }
                          }}
                        >
                          <img 
                            src={tpl.thumbnailUrl} 
                            alt={tpl.name} 
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">Magic Palette</h4>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={paletteContext}
                      onChange={(e) => setPaletteContext(e.target.value)}
                      placeholder="E.g., Cyberpunk neon"
                      className="w-full h-8 rounded border border-rose-200 bg-white dark:bg-zinc-900 px-2 text-xs"
                    />
                    <Button 
                      className="w-full h-8 text-xs bg-rose-600" 
                      onClick={handleMagicPalette}
                      disabled={isGeneratingPalette || !paletteContext}
                    >
                      {isGeneratingPalette ? 'Generating...' : 'Generate Palette'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Shapes</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="h-20 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={addRectangle}>
                      <Square className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                    <Button variant="outline" className="h-20 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={addCircle}>
                      <Circle className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                    <Button variant="outline" className="h-20 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={addTriangle}>
                      <Triangle className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                    <Button variant="outline" className="h-20 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={addStar}>
                      <Star className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                    <Button variant="outline" className="h-20 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={addHexagon}>
                      <Hexagon className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Icons</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => addSvgIcon('<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>', '#EF4444')}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </Button>
                    <Button variant="outline" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => addSvgIcon('<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>', '#10B981')}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-500"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </Button>
                    <Button variant="outline" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => addSvgIcon('<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.34.16-2h4.68c.09.66.16 1.32.16 2s-.07 1.34-.16 2zm1.18 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>', '#3B82F6')}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.34.16-2h4.68c.09.66.16 1.32.16 2s-.07 1.34-.16 2zm1.18 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
                    </Button>
                    <Button variant="outline" className="h-14 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => addSvgIcon('<svg viewBox="0 0 24 24"><path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/></svg>', '#6366F1')}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-500"><path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/></svg>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-16 justify-start px-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={addHeading}
                >
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Add a heading</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-14 justify-start px-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={addSubheading}
                >
                  <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Add a subheading</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-start px-4 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={addBodyText}
                >
                  <span className="text-sm font-normal text-zinc-900 dark:text-zinc-100">Add a little bit of body text</span>
                </Button>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search millions of photos..."
                    className="w-full h-9 pl-9 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setImageQuery(e.currentTarget.value);
                        setImagePage(1);
                      }
                    }}
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  {['Nature', 'Technology', 'Abstract', 'People', 'Business'].map(cat => (
                    <Button 
                      key={cat} 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs rounded-full whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 border-transparent"
                      onClick={() => {
                        setImageQuery(cat);
                        setImagePage(1);
                      }}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                <div className="columns-2 gap-2 space-y-2">
                  {images.map((img: any) => (
                    <div 
                      key={img.id} 
                      className="relative group rounded-md overflow-hidden cursor-pointer"
                      onClick={() => addImage(img.url)}
                    >
                      <img 
                        src={img.thumbnailUrl} 
                        alt="Search result" 
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', img.url);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white truncate w-full">{img.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div ref={observerTarget} className="h-10 flex items-center justify-center">
                  {isLoadingImages && <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Solid Colors</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {['#ffffff', '#000000', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#f43f5e', '#64748b', '#78716c', '#020617'].map(color => (
                      <button 
                        key={color} 
                        className="w-12 h-12 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => updateBackground(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Gradients</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['linear-gradient(to right, #ff7e5f, #feb47b)', 'linear-gradient(to right, #00c6ff, #0072ff)', 'linear-gradient(to right, #f12711, #f5af19)', 'linear-gradient(to right, #654ea3, #eaafc8)', 'linear-gradient(to right, #11998e, #38ef7d)'].map((gradient, i) => (
                      <button 
                        key={i} 
                        className="h-16 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm"
                        style={{ background: gradient }}
                        onClick={() => {
                           // For Fabric, gradients are a bit complex to parse from CSS. We will just use solid colors for now or apply a basic image/rect.
                           // As a fallback, we extract the first color for simplicity if not a true fabric Gradient.
                           // Actually, let's just pass the first hex color of the gradient since Fabric.js doesn't natively parse CSS `linear-gradient` strings in the fill property directly.
                           const colors = gradient.match(/#[a-f0-9]{6}/gi);
                           if (colors) {
                             updateBackground(colors[0]);
                           }
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">Note: Full gradient support requires pro API key.</p>
                </div>
              </div>
            )}

            {activeTab === 'brand' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Brand Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {brandKit.colors.map(color => (
                      <button 
                        key={color} 
                        className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (activeObject && (activeObject as any).type === 'i-text') {
                            (activeObject as any).set('fill', color);
                            canvas?.renderAll();
                          }
                        }}
                      />
                    ))}
                    {brandKit.colors.length === 0 && (
                      <p className="text-xs text-zinc-500">No brand colors configured. Setup in Dashboard.</p>
                    )}
                  </div>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Brand Fonts</h3>
                  <div className="space-y-2">
                    {Object.entries(brandKit.fonts).map(([key, fontName]: any) => fontName && (
                      <Button 
                        key={key} 
                        variant="outline" 
                        className="w-full justify-start text-zinc-700 dark:text-zinc-300"
                        onClick={() => {
                          if (activeObject && (activeObject as any).type === 'i-text') {
                            (activeObject as any).set('fontFamily', fontName);
                            canvas?.renderAll();
                          }
                        }}
                      >
                        <Type className="w-4 h-4 mr-2" />
                        <span className="capitalize">{key}:</span> <span className="ml-2 font-bold">{String(fontName)}</span>
                      </Button>
                    ))}
                    {!brandKit.fonts.heading && !brandKit.fonts.subheading && !brandKit.fonts.body && (
                      <p className="text-xs text-zinc-500">No fonts configured. Setup in Dashboard.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'uploads' && (
              <div className="space-y-4 text-center mt-8">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Upload your images</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Click to upload from your computer</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (f) => {
                        const dataUrl = f.target?.result as string;
                        addImage(dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload files
                </Button>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="space-y-6">
                
                <div className="p-4 border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                    Magic Write
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Generate a catchy slogan or text block instantly.</p>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={magicPrompt}
                      onChange={(e) => setMagicPrompt(e.target.value)}
                      placeholder="E.g., A slogan for a coffee shop"
                      className="w-full h-8 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 px-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Button 
                      className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" 
                      onClick={handleMagicWrite}
                      disabled={isGeneratingText || !magicPrompt}
                    >
                      {isGeneratingText ? 'Generating...' : 'Generate Text'}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-fuchsia-200 dark:border-fuchsia-900 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                    Magic Design
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Let AI build a beautiful layout for you in seconds.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-xs h-8 border-fuchsia-200 dark:border-fuchsia-800" 
                      onClick={() => handleMagicDesign('Resume')}
                      disabled={isGeneratingDesign}
                    >
                      Resume
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs h-8 border-fuchsia-200 dark:border-fuchsia-800" 
                      onClick={() => handleMagicDesign('Poster')}
                      disabled={isGeneratingDesign}
                    >
                      Poster
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs h-8 border-fuchsia-200 dark:border-fuchsia-800 col-span-2" 
                      onClick={() => handleMagicDesign('Logo')}
                      disabled={isGeneratingDesign}
                    >
                      {isGeneratingDesign ? 'Designing...' : 'Logo'}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                    <QrCode className="w-4 h-4" /> QR Code Generator
                  </h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                      placeholder="Enter a URL"
                      className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button 
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900"
                      onClick={() => {
                        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
                        addImage(apiUrl);
                      }}
                    >
                      Generate QR Code
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
