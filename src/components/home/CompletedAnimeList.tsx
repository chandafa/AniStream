'use client';

import { useState } from 'react';
import type { Anime } from '@/lib/types';
import { getCompletedAnime } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CompletedAnimeListProps {
  initialAnimes: Anime[];
}

export function CompletedAnimeList({ initialAnimes }: CompletedAnimeListProps) {
  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [page, setPage] = useState(2); // Start with page 2 since page 1 is initial data
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialAnimes.length > 0);

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    const data = await getCompletedAnime(page);
    if (data && data.anime.length > 0) {
      setAnimes((prevAnimes) => [...prevAnimes, ...data.anime]);
      setPage((prevPage) => prevPage + 1);
      setHasNextPage(data.pagination.hasNextPage);
    } else {
      setHasNextPage(false);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <AnimeList title="Completed Series" animes={animes} viewMoreLink="/category/completed" />
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
