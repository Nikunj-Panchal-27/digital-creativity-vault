import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Monitor, Smartphone, FileText, LayoutTemplate, 
  Plus, Star, Clock, Megaphone, Printer, Presentation as PresentationIcon, 
  Image as ImageIcon, MonitorPlay, Hexagon, CreditCard, Camera, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDesignStore } from '@/store/useDesignStore';

const CATEGORIES = [
  { id: 'recommended', name: 'Recommended', icon: Star },
  { id: 'recent', name: 'Recent Sizes', icon: Clock },
  { id: 'social', name: 'Social Media', icon: Smartphone },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'presentation', name: 'Presentation', icon: PresentationIcon },
  { id: 'video', name: 'Video', icon: MonitorPlay },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'print', name: 'Print', icon: Printer },
];

const PRESETS = [
  { id: 'ig-post', category: 'social', name: 'Instagram Post', width: 1080, height: 1080, desc: 'Square image for IG feed', icon: Camera },
  { id: 'ig-story', category: 'social', name: 'Instagram Story', width: 1080, height: 1920, desc: 'Vertical story format', icon: Smartphone },
  { id: 'fb-post', category: 'social', name: 'Facebook Post', width: 940, height: 788, desc: 'Standard FB feed post', icon: LayoutTemplate },
  { id: 'yt-thumb', category: 'social', name: 'YouTube Thumbnail', width: 1280, height: 720, desc: 'Catchy video thumbnail', icon: MonitorPlay },
  { id: 'presentation', category: 'presentation', name: 'Presentation', width: 1920, height: 1080, desc: '16:9 slides', icon: PresentationIcon },
  { id: 'poster', category: 'print', name: 'Poster', width: 2480, height: 3508, desc: 'Large format print', icon: LayoutTemplate },
  { id: 'resume', category: 'documents', name: 'Resume', width: 2480, height: 3508, desc: 'A4 standard', icon: FileText },
  { id: 'biz-card', category: 'print', name: 'Business Card', width: 1050, height: 600, desc: 'Standard business card', icon: CreditCard },
  { id: 'logo', category: 'marketing', name: 'Logo', width: 500, height: 500, desc: 'Brand identity', icon: Hexagon },
  { id: 'flyer', category: 'marketing', name: 'Flyer', width: 2480, height: 3508, desc: 'A4 promotional flyer', icon: FileText },
  { id: 'desktop', category: 'recommended', name: 'Desktop Wallpaper', width: 1920, height: 1080, desc: 'Standard HD wallpaper', icon: Monitor },
  { id: 'mobile', category: 'recommended', name: 'Mobile Wallpaper', width: 1080, height: 1920, desc: 'Vertical screen wallpaper', icon: Smartphone },
  { id: 'pin', category: 'social', name: 'Pinterest Pin', width: 1000, height: 1500, desc: 'Vertical pin layout', icon: ImageIcon },
  { id: 'linkedin', category: 'social', name: 'LinkedIn Banner', width: 1584, height: 396, desc: 'Professional cover image', icon: Monitor },
];

export function CreateDesignModal({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const setConfig = useDesignStore((state) => state.setConfig);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('recommended');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESETS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Size State
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [customUnit, setCustomUnit] = useState('px');

  const filteredPresets = useMemo(() => {
    let items = PRESETS;
    if (search.trim()) {
      items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()));
    } else {
      items = items.filter(p => p.category === activeCategory || activeCategory === 'recent' || activeCategory === 'recommended');
      if (activeCategory === 'recent' || activeCategory === 'recommended') {
        // Just show a mix for recommended/recent for now
        items = PRESETS.slice(0, 8);
      }
    }
    return items;
  }, [search, activeCategory]);

  const handleCreate = (config: { width: number, height: number, type: string, unit?: string, category?: string }) => {
    if (!config.width || !config.height) return;
    
    console.log('Selected preset:', config.type);
    console.log('Selected dimensions:', { width: config.width, height: config.height });
    
    // Save to Zustand
    setConfig({ width: config.width, height: config.height, type: config.type, unit: config.unit || 'px' });
    
    onOpenChange(false);
    console.log('Router push called');
    router.push(`/editor?type=${encodeURIComponent(config.type)}&width=${config.width}&height=${config.height}`);
  };

  const handleCustomSubmit = () => {
    const w = parseInt(customWidth);
    const h = parseInt(customHeight);
    if (!w || !h || w <= 0 || h <= 0) return;
    
    let pxW = w;
    let pxH = h;
    if (customUnit === 'in') { pxW = w * 96; pxH = h * 96; }
    if (customUnit === 'cm') { pxW = Math.round(w * 37.8); pxH = Math.round(h * 37.8); }
    if (customUnit === 'mm') { pxW = Math.round(w * 3.78); pxH = Math.round(h * 3.78); }

    handleCreate({ width: pxW, height: pxH, type: 'Custom Size', unit: customUnit });
  };

  const isFormValid = isCustomSize ? (parseInt(customWidth) > 0 && parseInt(customHeight) > 0) : selectedPreset !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 w-[95vw] sm:max-w-none md:w-[90vw] lg:max-w-[1400px] h-[95vh] md:h-[85vh] bg-zinc-950/95 backdrop-blur-xl border-zinc-800 p-0 overflow-hidden rounded-[24px] shadow-2xl flex flex-col">
        
        {/* Header */}
        <DialogHeader className="pt-[20px] px-[24px] pb-[16px] border-b border-zinc-800/50 flex flex-row items-center justify-between shrink-0 m-0 space-y-0">
          <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2 m-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            What will you design today?
          </DialogTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search sizes or templates..." 
                className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-indigo-500 rounded-full h-10 text-zinc-100 placeholder:text-zinc-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-full border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hidden md:flex">
              Recent Designs
            </Button>
            <Button variant="outline" className="rounded-full border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hidden md:flex">
              <Star className="w-4 h-4 mr-2" /> Favorites
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close modal"
              className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.15)] hover:scale-105 hover:rotate-90 transition-all duration-200 cursor-pointer shrink-0 ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {/* Main Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          
          {/* Sidebar */}
          <div className="w-full md:w-[280px] bg-zinc-900/30 border-b md:border-b-0 md:border-r border-zinc-800/50 flex flex-col md:p-4 shrink-0">
            <div className="flex-1 overflow-x-auto md:overflow-hidden md:pr-2 p-3 md:p-0 flex flex-row md:flex-col gap-2 md:gap-1 [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:w-1 md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-zinc-800 md:[&::-webkit-scrollbar-thumb]:rounded-full">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsCustomSize(false);
                    setSelectedPreset(null);
                    setSearch('');
                  }}
                  className={cn(
                    "whitespace-nowrap flex-none md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 md:px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    !isCustomSize && activeCategory === cat.id 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  <cat.icon className={cn("w-4 h-4", !isCustomSize && activeCategory === cat.id ? "text-indigo-400" : "text-zinc-500")} />
                  {cat.name}
                </button>
              ))}
            </div>
            
            <div className="hidden md:block pt-4 mt-2 border-t border-zinc-800/50 shrink-0">
              <button
                onClick={() => {
                  setIsCustomSize(true);
                  setSelectedPreset(null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isCustomSize 
                    ? "bg-purple-500/10 text-purple-400" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Plus className={cn("w-4 h-4", isCustomSize ? "text-purple-400" : "text-zinc-500")} />
                Custom Size
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-zinc-950 relative overflow-hidden flex flex-col min-w-0 min-h-0">
            <ScrollArea className="flex-1 min-h-0 p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
              <AnimatePresence mode="wait">
                {isCustomSize ? (
                  <motion.div 
                    key="custom"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="max-w-xl mx-auto mt-12 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-xl shadow-2xl"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <LayoutTemplate className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-zinc-100 tracking-tight">Custom Size</h3>
                        <p className="text-sm text-zinc-400 mt-1">Define the exact dimensions for your next masterpiece.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="flex gap-4 items-end flex-1 min-w-[200px]">
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Width</label>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="1080"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            className="bg-zinc-950/50 border-zinc-800 h-12 text-lg text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-purple-500"
                          />
                        </div>
                        <div className="pb-3">
                          <X className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Height</label>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="1080"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            className="bg-zinc-950/50 border-zinc-800 h-12 text-lg text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-purple-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 w-full sm:w-28 mt-2 sm:mt-0">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Unit</label>
                        <div className="relative">
                          <select 
                            className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 text-base text-zinc-100 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                          >
                            <option value="px">px</option>
                            <option value="in">in</option>
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="presets"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {search && (
                      <h3 className="text-lg font-medium text-zinc-100 mb-6">Search results for "{search}"</h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                      {filteredPresets.map((preset) => {
                        const isSelected = selectedPreset?.id === preset.id;
                        return (
                          <motion.button
                            key={preset.id}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPreset(preset)}
                            className={cn(
                              "group flex flex-col text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden h-[220px]",
                              isSelected 
                                ? "bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                                : "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 blur-2xl rounded-full -mr-10 -mt-10" />
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                              isSelected ? "bg-indigo-500/20" : "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                            )}>
                              <preset.icon className={cn("w-6 h-6", isSelected ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200")} />
                            </div>
                            <h4 className={cn("font-semibold mb-1", isSelected ? "text-indigo-100" : "text-zinc-100")}>{preset.name}</h4>
                            <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{preset.desc}</p>
                            <div className={cn("mt-auto text-[11px] font-mono px-2 py-1 rounded-md inline-block self-start", isSelected ? "bg-indigo-500/20 text-indigo-300" : "bg-zinc-900 text-zinc-500")}>
                              {preset.width} × {preset.height} px
                            </div>
                          </motion.button>
                        );
                      })}
                      {filteredPresets.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                          <Search className="w-12 h-12 text-zinc-700 mb-4" />
                          <h3 className="text-lg font-medium text-zinc-300 mb-2">No results found</h3>
                          <p className="text-zinc-500">Try adjusting your search or create a custom size.</p>
                          <Button variant="outline" className="mt-6 border-zinc-800 text-zinc-300" onClick={() => { setSearch(''); setIsCustomSize(true); }}>
                            Use Custom Size
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-4 px-6 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <Button onClick={() => onOpenChange(false)} variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full px-6">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (isCustomSize) handleCustomSubmit();
                  else if (selectedPreset) handleCreate({ width: selectedPreset.width, height: selectedPreset.height, type: selectedPreset.name });
                }}
                disabled={!isFormValid || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full px-8 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Design'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
