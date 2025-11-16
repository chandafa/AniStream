
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { HistoryItem, Anime } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getAnimeDetails } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { cleanSlug } from '@/lib/utils';

export function ContinueWatching() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);
  
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{history?: HistoryItem[]}>(userDocRef);

  const [lastWatched, setLastWatched] = useState<{ anime: Anime; episodeSlug: string } | null>(null);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  useEffect(() => {
    const fetchLastWatched = async () => {
      if (isUserLoading || isUserDataLoading) return;

      if (userData && userData.history && userData.history.length > 0) {
        setIsLoadingAnime(true);
        // The last item in the array is the most recently watched
        const lastHistoryItem = userData.history[userData.history.length - 1];
        
        const animeDetails = await getAnimeDetails(lastHistoryItem.animeSlug);

        if (animeDetails) {
          setLastWatched({
            anime: animeDetails,
            episodeSlug: lastHistoryItem.episodeSlug,
          });
        }
        setIsLoadingAnime(false);
      } else {
        setLastWatched(null);
        setIsLoadingAnime(false);
      }
    };

    fetchLastWatched();
  }, [userData, isUserLoading, isUserDataLoading]);
  
  const isLoading = isUserLoading || isUserDataLoading || isLoadingAnime;

  if (isLoading) {
    return <ContinueWatchingSkeleton />;
  }

  if (!user || !lastWatched) {
    return null; // Don't show anything if not logged in or no history
  }
  
  const { anime, episodeSlug } = lastWatched;

  return (
    <section>
        <h2 className="font-headline text-lg md:text-xl font-bold mb-3">Continue Watching</h2>
         <Card className="overflow-hidden bg-card/50 border-border/30">
            <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="relative aspect-video md:aspect-square w-full md:w-48 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={anime.poster}
                        alt={`Poster of ${anime.title}`}
                        className="object-cover w-full h-full"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                </div>
                <div className="p-4 flex flex-col justify-center">
                    <h3 className="font-headline text-lg font-semibold line-clamp-2 text-foreground">
                        {anime.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">You left off on episode {cleanSlug(episodeSlug).split('-').pop()}</p>
                    <Button asChild className="w-full md:w-auto">
                        <Link href={`/watch/${episodeSlug}`}>
                            <PlayCircle />
                            Continue Watching
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </section>
  );
}


export function ContinueWatchingSkeleton() {
    return (
        <section>
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-36 w-full" />
        </section>
    )
}

    