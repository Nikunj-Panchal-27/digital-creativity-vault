"use client";

import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Loader2, Trash2 } from 'lucide-react';

export default function TrashPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrash = () => {
    fetch('http://localhost:5000/api/projects/trash')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setProjects(data.projects);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    await fetch(`http://localhost:5000/api/projects/${id}/restore`, { method: 'PUT' });
    fetchTrash();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            <Trash2 className="w-8 h-8" /> Recycle Bin
          </h1>
          <p className="text-zinc-500 mt-2">Projects deleted will be permanently removed after 30 days.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">
            Your recycle bin is empty.
          </div>
        ) : (
          projects.map((project, i) => (
            <div key={project._id} className="relative group">
              <ProjectCard 
                id={project._id}
                title={project.name || 'Untitled Design'}
                updatedAt={new Date(project.updatedAt).toLocaleDateString()}
                thumbnail={project.thumbnailUrl}
                index={i}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRestore(project._id);
                }}
                className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
