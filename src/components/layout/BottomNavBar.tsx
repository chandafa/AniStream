'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, LayoutGrid, User, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/genres', label: 'Category', icon: LayoutGrid },
  { href: '/bookmarks', label: 'Library', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border/40 z-50">
      <nav className="flex justify-around items-center h-full">
        {navItems.map((item) => {
            let href = item.href;
            // if profile icon and not logged in, go to login
            if (item.label === 'Profile' && !user) {
                href = '/login';
            }
            return (
                <Link
                    key={item.label}
                    href={href}
                    className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors text-muted-foreground",
                    (pathname === href) && 'text-primary'
                    )}
                >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                </Link>
            )
        })}
      </nav>
    </div>
  );
}
