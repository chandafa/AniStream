// src/components/home/HomeCarousel.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListPlus, PlayCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { cleanSlug } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function HomeCarousel({ animes }: { animes: Anime[] }) {
  return (
    <Carousel 
        className="w-full"
        plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
        ]}
    >
      <CarouselContent>
        {animes.map((anime) => (
          <CarouselItem key={anime.slug}>
            <div className="relative h-[50vh] md:h-[60vh] w-full">
              <div className={cn("absolute inset-0 overflow-hidden rounded-xl")}>
                <Image
                  src={anime.poster}
                  alt={`Poster for ${anime.title}`}
                  fill
                  className="object-cover w-full h-full"
                  data-ai-hint="anime background"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent rounded-xl" />
              <div className="container relative z-10 flex h-full items-end pb-8 md:pb-16">
                <div className="max-w-xl space-y-3 md:space-y-4">
                  <h1 className="font-headline text-2xl md:text-5xl font-bold text-foreground animate-fade-in-down">
                    {anime.title}
                  </h1>

                  <div className="flex gap-2 md:gap-4">
                    <Button asChild size="lg" className="h-9 md:h-9">
                      <Link href={anime.latestEpisode ? `/watch/${cleanSlug(anime.latestEpisode.slug)}` : `/anime/${cleanSlug(anime.slug)}`}>
                        <PlayCircle />
                        Play
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="h-9 md:h-9">
                      <Link href={`/anime/${cleanSlug(anime.slug)}`}>
                        <ListPlus />
                        My List
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
    </Carousel>
  );
}
