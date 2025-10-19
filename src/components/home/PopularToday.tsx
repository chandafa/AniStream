import type { Anime } from '@/lib/types';
import { AnimeCard } from '../anime/AnimeCard';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

interface PopularTodayProps {
  animes: Anime[];
}

export function PopularToday({ animes }: PopularTodayProps) {
    if (!animes || animes.length === 0) return null;

  return (
    <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl md:text-3xl font-bold">Popular Today</h2>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-4">
        {animes.map((anime, index) => (
          <AnimeCard key={anime.slug} anime={anime} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}