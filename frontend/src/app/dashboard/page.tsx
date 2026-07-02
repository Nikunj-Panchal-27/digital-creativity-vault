"use client";

import { motion } from 'framer-motion';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  FileText, MonitorPlay, Presentation, 
  Smartphone, LayoutTemplate, MessageSquare, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateDesignModal } from '@/components/dashboard/CreateDesignModal';
import { useDesignStore } from '@/store/useDesignStore';

const quickActions = [
  { name: 'Doc', icon: FileText, color: 'bg-blue-500' },
  { name: 'Whiteboard', icon: LayoutTemplate, color: 'bg-indigo-500' },
  { name: 'Presentation', icon: Presentation, color: 'bg-orange-500' },
  { name: 'Social Media', icon: Smartphone, color: 'bg-pink-500' },
  { name: 'Video', icon: MonitorPlay, color: 'bg-purple-500' },
  { name: 'Website', icon: MonitorPlay, color: 'bg-teal-500' },
  { name: 'More', icon: MessageSquare, color: 'bg-zinc-700' },
];

const mockTemplates = [
  {
    title: 'Modern Startup Pitch',
    category: 'Presentation',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPremium: true,
  },
  {
    title: 'Minimalist Portfolio',
    category: 'Website',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPremium: false,
  },
  {
    title: 'Social Media Campaign',
    category: 'Instagram Post',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPremium: true,
  },
  {
    title: 'Corporate Report 2024',
    category: 'A4 Document',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPremium: false,
  },
  {
    title: 'Creative Agency Deck',
    category: 'Presentation',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPremium: true,
  },
];

const mockProjects = [
  {
    id: '1',
    title: 'Q3 Marketing Strategy',
    updatedAt: '2 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Instagram Carousel',
    updatedAt: 'Yesterday',
    thumbnail: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Client Pitch Deck',
    updatedAt: '3 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Untitled Design',
    updatedAt: 'Last week',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isCreateModalOpen, setCreateModalOpen } = useDesignStore();

  const fetchProjects = () => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setProjects(data.projects);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleTrash = async (id: string) => {
    await fetch(`http://localhost:5000/api/projects/${id}/trash`, { method: 'PUT' });
    fetchProjects();
  };

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-12">
      <CreateDesignModal open={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
      
      {/* Header / Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-zinc-800 p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=2564&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">What will you design today?</h1>
          <p className="text-zinc-300 text-lg mb-8">Start with a template or create something new.</p>
          
          <div className="flex bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-700/50 p-2 shadow-xl">
            <input 
              type="text" 
              placeholder="Search templates, projects, and more..." 
              className="flex-1 bg-transparent border-none text-zinc-900 dark:text-zinc-100 px-4 focus:outline-none placeholder:text-zinc-500"
            />
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              Search
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Create a design</h2>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button 
                  onClick={handleCreateNew}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors group min-w-[100px]"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{action.name}</span>
                </button>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="bg-zinc-200 dark:bg-zinc-900" />
        </ScrollArea>
      </section>

      {/* Recommended Templates */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Recommended for you</h2>
          <Button variant="link" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View all</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mockTemplates.map((template, i) => (
            <TemplateCard 
              key={i}
              title={template.title}
              category={template.category}
              thumbnail={template.thumbnail}
              isPremium={template.isPremium}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Recent Designs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Recent designs</h2>
          <Button variant="link" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View all</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              No projects found. Create one above!
            </div>
          ) : (
            projects.map((project, i) => (
              <ProjectCard 
                key={project._id}
                id={project._id}
                title={project.name || 'Untitled Design'}
                updatedAt={new Date(project.updatedAt).toLocaleDateString()}
                thumbnail={project.thumbnailUrl}
                index={i}
                onTrash={handleTrash}
              />
            ))
          )}
        </div>
      </section>

    </div>
  );
}
