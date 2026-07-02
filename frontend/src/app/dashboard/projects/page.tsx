import { FolderOpen } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-zinc-500" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-100 mb-4">Your Projects</h1>
      <p className="text-zinc-400 max-w-md">
        All your designs, folders, and uploaded assets will live here.
        Start by creating a new design!
      </p>
    </div>
  );
}
