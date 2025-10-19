import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={anime.poster}
              alt={`Poster of ${anime.title}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
            {anime.latestEpisode && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white backdrop-blur-sm">
                    {anime.latestEpisode.title}
                </div>
            )}
            {anime.current_episode && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white backdrop-blur-sm">
                    {anime.current_episode}
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-2 pt-2 min-h-14">
            <h3 className="font-headline text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
        </CardFooter>
      </Card>
    </Link>
  );
}
