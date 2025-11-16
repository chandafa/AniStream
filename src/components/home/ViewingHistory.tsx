
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { HistoryItem, Anime } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getAnimeDetails } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { AnimeList } from '../anime/AnimeList';

export function ViewingHistory() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);
  
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{history?: HistoryItem[]}>(userDocRef);

  const [historyAnime, setHistoryAnime] = useState<Anime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  useEffect(() => {
    const fetchHistoryAnime = async () => {
      if (isUserLoading || isUserDataLoading) return;

      if (userData && userData.history && userData.history.length > 0) {
        setIsLoadingAnime(true);
        // Get unique anime slugs from history, sorted by most recent
        const uniqueAnimeSlugs = [
            ...new Map(userData.history.reverse().map(item => [item.animeSlug, item])).values()
        ].map(item => item.animeSlug);
        
        const animePromises = uniqueAnimeSlugs.map(slug => getAnimeDetails(slug));
        const animeResults = await Promise.all(animePromises);
        const validAnime = animeResults.filter(anime => anime !== null) as Anime[];
        setHistoryAnime(validAnime);
        setIsLoadingAnime(false);
      } else {
        setHistoryAnime([]);
        setIsLoadingAnime(false);
      }
    };

    fetchHistoryAnime();
  }, [userData, isUserLoading, isUserDataLoading]);
  
  const isLoading = isUserLoading || isUserDataLoading || isLoadingAnime;

  if (isLoading) {
    return <ViewingHistorySkeleton />;
  }

  if (!user || historyAnime.length === 0) {
    return null; // Don't show anything if not logged in or no history
  }

  return (
    <AnimeList title="My History" animes={historyAnime} viewMoreLink="/history" />
  );
}


export function ViewingHistorySkeleton() {
    return (
        <section>
            <Skeleton className="h-8 w-48 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2.5 gap-y-5 md:gap-x-4 md:gap-y-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[2/3] w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </div>
                ))}
            </div>
        </section>
    )
}
