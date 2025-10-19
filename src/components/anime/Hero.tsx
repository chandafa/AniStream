import Image from 'next/image';
import Link from 'next/link';
import type { Anime, AnimeDetail } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListPlus, PlayCircle, Star } from 'lucide-react';
import { getAnimeDetails } from '@/lib/api';
import { GenrePills } from '@/components/home/GenrePills';

async function getDetails(slug: string): Promise<AnimeDetail | null> {
    // This is not efficient, but the API doesn't provide genres in the home data
    return getAnimeDetails(slug);
}


export async function Hero({ anime }: { anime: Anime }) {
  const details = await getDetails(anime.slug);

  return (
    <div className="relative h-[60vh] w-full">
      <Image
        src={anime.poster}
        alt={`Poster for ${anime.title}`}
        fill
        priority
        className="object-cover"
        data-ai-hint="anime background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      <div className="container relative z-10 flex h-full items-end pb-8 md:pb-16">
        <div className="max-w-xl space-y-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground">
            {anime.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {anime.rating && (
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{anime.rating}</span>
                </div>
            )}
            {details && <GenrePills genres={details.genres.slice(0,3)} />}
          </div>
          
          <p className="text-muted-foreground line-clamp-3">
            {details?.synopsis}
          </p>

          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href={`/watch/${anime.latestEpisode?.slug ?? anime.slug}`}>
                <PlayCircle />
                Play
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`/anime/${anime.slug}`}>
                <ListPlus />
                My List
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}