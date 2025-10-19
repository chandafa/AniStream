import type { Anime } from '@/lib/types';
import { AnimeCard } from '../anime/AnimeCard';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface PopularTodayProps {
  animes: Anime[];
}

export function PopularToday({ animes }: PopularTodayProps) {
    if (!animes || animes.length === 0) return null;

  return (
    <section>
        <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline text-lg md:text-xl font-bold">Trending</h2>
            <Button variant="ghost" asChild className='hidden md:flex' size="sm">
                <Link href="/category/ongoing">
                    View More <ChevronRight className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="link" asChild className='md:hidden text-primary'>
                <Link href="/category/ongoing">
                    See all
                </Link>
            </Button>
        </div>
        <div className="md:hidden">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 pb-4">
                    {animes.map((anime, index) => (
                        <AnimeCard key={anime.slug} anime={anime} rank={index + 1} className="w-[140px]" />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {animes.map((anime, index) => (
          <AnimeCard key={anime.slug} anime={anime} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
