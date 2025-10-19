
'use client';

import { useEffect, useState } from 'react';
import type { Anime } from '@/lib/types';
import { getDonghuaHome } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function DonghuaList() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
        setIsLoading(true);
        const initialAnimes = await getDonghuaHome(1);
        if (initialAnimes) {
            setAnimes(initialAnimes);
            setPage(2);
            setHasNextPage(initialAnimes.length > 0);
        } else {
            setHasNextPage(false);
        }
        setIsLoading(false);
    }
    fetchInitialData();
  }, []);

  const handleLoadMore = async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    const data = await getDonghuaHome(page);
    if (data && data.length > 0) {
      setAnimes((prevAnimes) => [...prevAnimes, ...data]);
      setPage((prevPage) => prevPage + 1);
      setHasNextPage(data.length > 0);
    } else {
      setHasNextPage(false);
    }
    setIsLoading(false);
  };
  
  if (isLoading && animes.length === 0) {
    return (
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2.5 gap-y-5 md:gap-x-4 md:gap-y-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
      );
  }

  if (animes.length === 0) return null;

  return (
    <div>
      <AnimeList title="Donghua" animes={animes} />
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
