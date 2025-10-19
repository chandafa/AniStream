
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { AniStreamLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/anime-list', label: 'Anime List' },
  { href: '/schedule', label: 'Jadwal Rilis' },
  { href: '/category/ongoing', label: 'On-Going Anime' },
  { href: '/genres', label: 'Genre List' },
];

export function AppHeader() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  const isHome = pathname === '/';

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "md:sticky",
        isHome ? "absolute top-0 z-50 w-full bg-transparent border-none md:sticky md:bg-background/95 md:border-b" : ""
    )}>
      <div className="container flex h-12 items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
                <AniStreamLogo />
            </Link>
        </div>
        
        {/* Center Section: Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center space-x-5 text-xs font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Search */}
        <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
