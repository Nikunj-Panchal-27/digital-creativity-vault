import { Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TemplateCardProps {
  title: string;
  category: string;
  thumbnail: string;
  isPremium?: boolean;
  index: number;
}

export function TemplateCard({ title, category, thumbnail, isPremium, index }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      className="h-full"
    >
      <Card className="border-0 bg-transparent h-full cursor-pointer group overflow-hidden">
        <div className="aspect-[4/5] rounded-xl bg-zinc-100 dark:bg-zinc-800 relative w-full overflow-hidden mb-3">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {isPremium && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-full shadow-lg">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Use this template
            </span>
          </div>
        </div>
        <div className="px-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">{title}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{category}</p>
        </div>
      </Card>
    </motion.div>
  );
}
