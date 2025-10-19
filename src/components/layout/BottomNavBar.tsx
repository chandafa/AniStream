'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/history', label: 'History', icon: History },
  { href: '/login', label: 'Profile', icon: User },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border/40 z-50">
      <nav className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors text-muted-foreground",
              pathname === item.href && 'text-primary'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
