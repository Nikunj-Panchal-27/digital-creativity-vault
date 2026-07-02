import { useState } from 'react';
import { useEditorContext } from './EditorContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function ExportModal({ children }: { children: React.ReactNode }) {
  const { exportDesign } = useEditorContext();
  const [format, setFormat] = useState<'png' | 'jpeg' | 'svg' | 'pdf' | 'webp'>('png');
  const [quality, setQuality] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    exportDesign({ format, quality, transparent });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">Export Design</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-zinc-700 dark:text-zinc-300">File Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['png', 'jpeg', 'webp', 'pdf', 'svg'].map(f => (
                <Button 
                  key={f}
                  variant={format === f ? 'default' : 'outline'}
                  size="sm"
                  className={`uppercase ${format === f ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                  onClick={() => setFormat(f as any)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {(format === 'jpeg' || format === 'webp') && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-zinc-700 dark:text-zinc-300">Quality</Label>
                <span className="text-xs text-zinc-500">{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" max="1.0" step="0.1" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}

          {(format === 'png' || format === 'webp' || format === 'svg') && (
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="transparent" 
                checked={transparent} 
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-600"
              />
              <Label htmlFor="transparent" className="text-zinc-700 dark:text-zinc-300 cursor-pointer">Transparent Background</Label>
            </div>
          )}

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Download File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
