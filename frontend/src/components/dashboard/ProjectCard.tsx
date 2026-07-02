import { MoreHorizontal, FileText, Share2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  thumbnail?: string;
  index: number;
  onTrash?: (id: string) => void;
}

export function ProjectCard({ id, title, updatedAt, thumbnail, index, onTrash }: ProjectCardProps) {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group overflow-hidden">
        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative w-full overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
              <FileText className="w-12 h-12 text-indigo-500/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
              onClick={() => router.push(`/editor/${id}`)}
            >
              Edit
            </Button>
          </div>
        </div>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="overflow-hidden">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{title}</h3>
            <p className="text-xs text-zinc-500 mt-1">Edited {updatedAt}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200">
              <DropdownMenuItem className="hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              {onTrash && (
                <DropdownMenuItem 
                  className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  onClick={() => onTrash(id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  );
}
