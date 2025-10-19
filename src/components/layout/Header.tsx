
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Menu, Search } from 'lucide-react';
import { AniStreamLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
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
  const [open, setOpen] = useState(false);
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
      <div className="container flex h-14 items-center">
        {/* Mobile Logo */}
        <div className="md:hidden flex-1">
            <Link href="/" className="flex items-center space-x-2">
                <AniStreamLogo />
            </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AniStreamLogo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
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

        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/bookmarks">Bookmarks</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/login">Login</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/register">Sign Up</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
