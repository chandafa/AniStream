
'use client';

import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { AnimeCard } from '@/components/anime/AnimeCard';
import type { Anime } from '@/lib/types';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getAnimeDetails } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// export const metadata: Metadata = {
//   title: 'Viewing History',
//   ...sharedMetadata,
// };

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{history?: string[]}>(userDocRef);

  const [historyAnime, setHistoryAnime] = useState<Anime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  useEffect(() => {
    document.title = 'Viewing History | AniStream';

    const fetchHistoryAnime = async () => {
      if (userData && userData.history) {
        setIsLoadingAnime(true);
        // Remove duplicates and get unique anime slugs
        const uniqueAnimeSlugs = [...new Set(userData.history)];
        const animePromises = uniqueAnimeSlugs.map(slug => getAnimeDetails(slug));
        const animeResults = await Promise.all(animePromises);
        const validAnime = animeResults.filter(anime => anime !== null) as Anime[];
        setHistoryAnime(validAnime);
        setIsLoadingAnime(false);
      } else if (!isUserDataLoading) {
        setHistoryAnime([]);
        setIsLoadingAnime(false);
      }
    };

    if (!isUserDataLoading) {
      fetchHistoryAnime();
    }
  }, [userData, isUserDataLoading]);

  const isLoading = isUserLoading || isUserDataLoading || isLoadingAnime;

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="container text-center py-16">
            <p className="text-lg text-muted-foreground">You need to be logged in to see your history.</p>
            <Button asChild className="mt-4">
                <Link href="/login">Login</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">Viewing History</h1>
      {historyAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {historyAnime.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Your viewing history is empty.</p>
          <p className="text-sm text-muted-foreground">Start watching to build your history.</p>
        </div>
      )}
    </div>
  );
}
