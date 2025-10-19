import Image from 'next/image';
import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

export function Hero({ anime }: { anime: Anime }) {
  return (
    <div className="relative h-[40vh] md:h-[60vh] w-full">
      <Image
        src={anime.poster}
        alt={`Poster for ${anime.title}`}
        fill
        priority
        className="object-cover"
        data-ai-hint="anime background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      <div className="container relative z-10 flex h-full items-end pb-8 md:pb-16">
        <div className="max-w-lg space-y-4">
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground">
            {anime.title}
          </h1>
          {anime.latestEpisode && (
              <p className="text-sm md:text-base text-muted-foreground">
                {anime.latestEpisode.title}
              </p>
          )}
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href={`/watch/${anime.latestEpisode?.slug ?? anime.slug}`}>
                <PlayCircle />
                Watch Now
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`/anime/${anime.slug}`}>
                Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
