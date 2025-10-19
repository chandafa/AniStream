import type { Anime } from '@/lib/types';
import { AnimeCard } from './AnimeCard';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

interface AnimeListProps {
  title: string;
  animes: Anime[];
  viewMoreLink?: string;
}

export function AnimeList({ title, animes, viewMoreLink }: AnimeListProps) {
    if (!animes || animes.length === 0) return null;

  return (
    <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
            {viewMoreLink && (
                <Button variant="ghost" asChild>
                    <Link href={viewMoreLink}>
                        View More <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {animes.map((anime) => (
          <AnimeCard key={anime.slug} anime={anime} />
        ))}
      </div>
    </section>
  );
}
