
'use client';

import { useState } from 'react';
import type { Anime } from '@/lib/types';
import { getMovies } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MovieListProps {
  initialMovies: Anime[];
}

export function MovieList({ initialMovies }: MovieListProps) {
  const [movies, setMovies] = useState<Anime[]>(initialMovies);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialMovies.length > 0);

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    const data = await getMovies(page);
    if (data && data.anime.length > 0) {
      setMovies((prevMovies) => [...prevMovies, ...data.anime]);
      setPage((prevPage) => prevPage + 1);
      setHasNextPage(data.pagination.hasNextPage);
    } else {
      setHasNextPage(false);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <AnimeList title="All Movies" animes={movies} />
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
