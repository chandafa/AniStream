
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

// Since this is a client component, we set the title dynamically
// export const metadata: Metadata = {
//   title: 'My Bookmarks',
//   ...sharedMetadata,
// };

export default function BookmarksPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => 
    user ? doc(firestore, 'users', user.uid) : null
  , [user, firestore]);
  
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{bookmarks?: string[]}>(userDocRef);
  
  const [bookmarkedAnime, setBookmarkedAnime] = useState<Anime[]>([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  useEffect(() => {
    document.title = 'My Bookmarks | OtakuStream';

    const fetchBookmarkedAnime = async () => {
      if (userData && userData.bookmarks) {
        setIsLoadingAnime(true);
        const animePromises = userData.bookmarks.map(slug => getAnimeDetails(slug));
        const animeResults = await Promise.all(animePromises);
        const validAnime = animeResults.filter(anime => anime !== null) as Anime[];
        setBookmarkedAnime(validAnime);
        setIsLoadingAnime(false);
      } else if (!isUserDataLoading) {
        setBookmarkedAnime([]);
        setIsLoadingAnime(false);
      }
    };

    if (!isUserDataLoading) {
      fetchBookmarkedAnime();
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
            <p className="text-lg text-muted-foreground">You need to be logged in to see your bookmarks.</p>
            <Button asChild className="mt-4">
                <Link href="/login">Login</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">My Bookmarks</h1>
      {bookmarkedAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {bookmarkedAnime.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">You haven&apos;t bookmarked any anime yet.</p>
          <p className="text-sm text-muted-foreground">Start exploring and save your favorites!</p>
        </div>
      )}
    </div>
  );
}
