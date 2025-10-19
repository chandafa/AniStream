import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  rank?: number;
}

function cleanSlug(slug: string): string {
    if (slug.includes('otakudesu.best/anime/')) {
        try {
            const url = new URL(slug);
            const pathParts = url.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1];
        } catch (e) {
            // Fallback for invalid URLs, though unlikely
            const parts = slug.split('/');
            return parts[parts.length - 1] || slug;
        }
    }
    return slug;
}


export function AnimeCard({ anime, className, rank }: AnimeCardProps) {
  const safeSlug = cleanSlug(anime.slug);
  return (
    <Link href={`/anime/${safeSlug}`} className={cn("group block", className)}>
      <div className="flex items-end space-x-4">
        {rank && (
          <div className="text-8xl font-black text-stroke-2 text-transparent stroke-white/20 -mb-5">
            {rank}
          </div>
        )}
        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 w-full">
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
          {!rank && (
            <CardFooter className="p-2 pt-2 min-h-14">
                <h3 className="font-headline text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {anime.title}
                </h3>
            </CardFooter>
          )}
        </Card>
      </div>
    </Link>
  );
}
