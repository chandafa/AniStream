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

export function HomeCarousel({ animes }: { animes: Anime[] }) {
  return (
    <Carousel 
        className="w-full"
        plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
        ]}
    >
      <CarouselContent>
        {animes.map((anime) => (
          <CarouselItem key={anime.slug}>
            <div className="relative h-[60vh] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={anime.poster}
                alt={`Poster for ${anime.title}`}
                className="object-cover w-full h-full"
                data-ai-hint="anime background"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
              <div className="container relative z-10 flex h-full items-end pb-8 md:pb-16">
                <div className="max-w-xl space-y-4">
                  <h1 className="font-headline text-4xl md:text-6xl font-bold text-foreground animate-fade-in-down">
                    {anime.title}
                  </h1>

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
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
    </Carousel>
  );
}
