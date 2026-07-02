import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, FolderOpen, LayoutTemplate, Palette, 
  Trash2, Users, Star, Crown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
  { name: 'Brand Kit', href: '/dashboard/brand', icon: Palette },
];

const secondaryItems = [
  { name: 'Shared with you', href: '/dashboard/shared', icon: Users },
  { name: 'Favorites', href: '/dashboard/favorites', icon: Star },
  { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col hidden md:flex shrink-0">
      <div className="p-4 flex-1 space-y-8 overflow-y-auto">
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100/50 dark:hover:text-white dark:hover:bg-zinc-800/50 transition-all",
                  pathname === item.href ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium" : ""
                )}
              >
                <item.icon className={cn("w-5 h-5 mr-3", pathname === item.href ? "text-indigo-400" : "")} />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="space-y-1">
          <h4 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Workspace</h4>
          {secondaryItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/50 dark:hover:text-white dark:hover:bg-zinc-800/50 transition-all",
                  pathname === item.href ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium" : ""
                )}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-100 dark:from-indigo-900/40 to-purple-100 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/20 relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-pulse" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Try Premium</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            Get unlimited premium templates and 1TB storage.
          </p>
          <Button size="sm" className="w-full bg-white text-zinc-900 hover:bg-zinc-200">
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
