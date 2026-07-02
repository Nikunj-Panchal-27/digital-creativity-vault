import { useState, useEffect } from 'react';
import { useEditorContext } from './EditorContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function VersionHistoryModal({ projectId, children }: { projectId: string; children: React.ReactNode }) {
  const { loadProjectJSON } = useEditorContext();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && projectId !== 'test-project') {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data.project && data.project.versions) {
            setVersions(data.project.versions.reverse());
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, projectId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-5 h-5" /> Version History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading history...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-zinc-500">No version history available.</p>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div key={version._id || index} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">{index === 0 ? 'Latest Auto-Save' : 'Older Version'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    onClick={() => {
                      if (window.confirm("Restore this version? Unsaved changes will be lost.")) {
                        loadProjectJSON(version.canvasState);
                        setOpen(false);
                      }
                    }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
