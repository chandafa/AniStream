
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Bookmark, History as HistoryIcon, LogOut, LogIn, ChevronDown, Film, Tv } from 'lucide-react';
import { AniStreamLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from '../theme-toggle';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "@/components/ui/navigation-menu"
import React from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/anime-list', label: 'Anime List' },
  { href: '/schedule', label: 'Jadwal Rilis' },
  { href: '/genres', label: 'Genre List' },
];

const animeComponents: { title: string; href: string; description: string }[] = [
    {
      title: "Anime Ongoing",
      href: "/category/ongoing",
      description:
        "Daftar anime yang sedang tayang.",
    },
    {
      title: "Anime Completed",
      href: "/category/completed",
      description:
        "Daftar anime yang sudah tamat.",
    },
]

const donghuaComponents: { title: string; href: string; description: string }[] = [
    {
        title: "Donghua Ongoing",
        href: "/donghua/ongoing",
        description:
          "Daftar donghua yang sedang tayang.",
      },
      {
        title: "Donghua Completed",
        href: "/donghua/completed",
        description:
          "Daftar donghua yang sudah tamat.",
      },
  ]

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isHome = pathname === '/';

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "md:sticky",
        isHome ? "absolute top-0 z-50 w-full bg-transparent border-none md:sticky md:bg-background/95 md:border-b" : ""
    )}>
      <div className="container flex h-12 items-center">
        {/* Left Section: Logo */}
        <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
                <AniStreamLogo />
            </Link>
        </div>
        
        {/* Center Section: Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-center">
        <NavigationMenu>
            <NavigationMenuList>
                {navLinks.map((link) => (
                    <NavigationMenuItem key={link.href}>
                         {link.label === 'Anime List' ? (
                            <>
                                <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "bg-transparent text-xs", pathname.startsWith("/category") || pathname.startsWith("/donghua") ? "text-primary" : "text-foreground/60")}>Category</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:grid-cols-3 lg:w-[600px] ">
                                        <div className="flex flex-col">
                                            <h3 className="font-semibold text-sm mb-2 px-3 flex items-center gap-2"><Tv /> Anime</h3>
                                            <ul className="flex flex-col">
                                                {animeComponents.map((component) => (
                                                <ListItem
                                                    key={component.title}
                                                    title={component.title}
                                                    href={component.href}
                                                >
                                                    {component.description}
                                                </ListItem>
                                                ))}
                                            </ul>
                                        </div>
                                         <div className="flex flex-col">
                                            <h3 className="font-semibold text-sm mb-2 px-3 flex items-center gap-2"><Tv /> Donghua</h3>
                                            <ul className="flex flex-col">
                                                {donghuaComponents.map((component) => (
                                                <ListItem
                                                    key={component.title}
                                                    title={component.title}
                                                    href={component.href}
                                                >
                                                    {component.description}
                                                </ListItem>
                                                ))}
                                            </ul>
                                        </div>
                                         <div className="flex flex-col">
                                            <h3 className="font-semibold text-sm mb-2 px-3 flex items-center gap-2"><Film /> Movies</h3>
                                            <ul className="flex flex-col">
                                                <ListItem
                                                    title="All Movies"
                                                    href="/movies"
                                                >
                                                   Browse our collection of animated movies.
                                                </ListItem>
                                            </ul>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </>
                         ) : (
                            <Link href={link.href} passHref>
                                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-xs", pathname === link.href ? "text-primary" : "text-foreground/60")}>
                                {link.label}
                                </NavigationMenuLink>
                            </Link>
                         )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
        </div>

        {/* Right Section: Search & Profile */}
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            <ThemeToggle />

            <div className="hidden md:flex">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile"><User /> Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/bookmarks"><Bookmark /> Bookmarks</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/history"><HistoryIcon /> History</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild size="icon" variant="ghost">
                        <Link href="/login">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Login</span>
                        </Link>
                    </Button>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

    