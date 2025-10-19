import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  rank?: number;
}

function cleanSlug(slug: string): string {
    if (!slug) return '';
    // Handle Otakudesu URLs specifically
    if (slug.includes('otakudesu.best/anime/')) {
        try {
            const url = new URL(slug);
            const pathParts = url.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1];
        } catch (e) {
            const parts = slug.split('/');
            return parts[parts.length - 1] || slug;
        }
    }
    // Handle Anichin URLs from Donghua API
    if (slug.startsWith('/anichin/')) {
        const parts = slug.split('/').filter(Boolean);
        // Assumes URL is like /anichin/anime/the-slug/
        if (parts[0] === 'anichin' && parts[1] === 'anime' && parts[2]) {
            return parts[2];
        }
    }

    // Default case for simple slugs
    return slug;
}

export function AnimeCard({ anime, className, rank }: AnimeCardProps) {
  if (!anime) return null;

  // Use the 'url' for Donghua if available to get the correct series slug
  const safeSlug = anime.url ? cleanSlug(anime.url) : cleanSlug(anime.slug);
  const episodeText = anime.latestEpisode?.title || anime.current_episode;
  
  return (
    <div className={cn("group", className)}>
        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 w-full rounded-lg">
          <CardContent className="p-0">
            <Link href={`/anime/${safeSlug}`}>
                <div className="relative aspect-[2/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={anime.poster}
                    alt={`Poster of ${anime.title}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="h-10 w-10 text-white/80" />
                </div>
                
                {rank && (
                  <div className="absolute top-2 left-2 h-6 w-6 bg-red-600/90 rounded-full flex items-center justify-center">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {anime.type && anime.type !== "Movie" && (
                  <Badge className="absolute top-2 right-2 bg-red-600/90 text-white rounded-md">{anime.type}</Badge>
                )}
                
                {episodeText && (
                  <Badge variant="secondary" className="absolute bottom-2 left-2 bg-black/70 text-white rounded-md">
                    {episodeText.replace(" Episode", "")}
                  </Badge>
                )}

                <Badge className="absolute bottom-2 right-2 bg-yellow-500 text-black rounded-md">Sub</Badge>

                </div>
            </Link>
          </CardContent>
        </Card>
      <Link href={`/anime/${safeSlug}`}>
        <h3 className="mt-2 font-headline text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {anime.title}
        </h3>
      </Link>
    </div>
  );
}
