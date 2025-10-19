
'use client';

import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, Settings, Shield, Film, Bookmark, Star } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const XP_PER_WATCH = 10;
const XP_PER_BOOKMARK = 5;
const XP_FOR_NEXT_LEVEL = 100;

interface UserProfileData {
  bookmarks?: string[];
  history?: string[];
  xp?: number;
  level?: number;
}

const badges = [
  { id: 'newbie', name: 'Newbie', icon: Star, description: 'Welcome! You started your journey.', requiredXP: 0 },
  { id: 'watcher', name: 'Watcher', icon: Film, description: 'Watched at least 5 anime episodes.', requiredHistory: 5 },
  { id: 'collector', name: 'Collector', icon: Bookmark, description: 'Bookmarked 10 anime series.', requiredBookmarks: 10 },
  { id: 'veteran', name: 'Veteran', icon: Shield, description: 'Reached Level 5.', requiredLevel: 5 },
];


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() =>
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserProfileData>(userDocRef);

  useEffect(() => {
    document.title = 'My Profile | AniStream';
  }, []);

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

  const { level, currentXp, xpForNextLevel, xpProgress, earnedBadges } = useMemo(() => {
    const historyCount = userData?.history?.length ?? 0;
    const bookmarkCount = userData?.bookmarks?.length ?? 0;
    const totalXp = (historyCount * XP_PER_WATCH) + (bookmarkCount * XP_PER_BOOKMARK);
    
    const level = Math.floor(totalXp / XP_FOR_NEXT_LEVEL) + 1;
    const xpForThisLevel = (level - 1) * XP_FOR_NEXT_LEVEL;
    const currentXp = totalXp - xpForThisLevel;
    const xpProgress = (currentXp / XP_FOR_NEXT_LEVEL) * 100;

    const earnedBadges = badges.filter(badge => {
      if (badge.id === 'newbie') return true;
      if (badge.requiredHistory && historyCount >= badge.requiredHistory) return true;
      if (badge.requiredBookmarks && bookmarkCount >= badge.requiredBookmarks) return true;
      if (badge.requiredLevel && level >= badge.requiredLevel) return true;
      return false;
    });

    return {
      level,
      currentXp,
      xpForNextLevel: XP_FOR_NEXT_LEVEL,
      xpProgress,
      earnedBadges,
    };
  }, [userData]);


  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container text-center py-16">
        <p className="text-lg text-muted-foreground">You need to be logged in to see your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline text-xl">{user.displayName || 'Anonymous User'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="space-y-2 text-center">
                <div className="flex justify-between items-center px-1">
                    <Badge variant="secondary">Level {level}</Badge>
                    <span className="text-xs text-muted-foreground">{currentXp} / {xpForNextLevel} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
             </div>
          </CardContent>
           <CardFooter className="flex-col gap-2">
                <Button variant="outline" className="w-full justify-start">
                    <Settings /> Edit Profile
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut /> Logout
                </Button>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Badges</CardTitle>
                <CardDescription>Your collection of achievements.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-4">
                        {earnedBadges.map((badge) => (
                             <Tooltip key={badge.id}>
                                <TooltipTrigger>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <div className="p-2 bg-muted rounded-full border-2 border-primary/50">
                                            <badge.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className="text-xs font-medium">{badge.name}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

