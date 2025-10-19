// src/components/home/HomeHero.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListPlus, PlayCircle } from 'lucide-react';
import { cleanSlug } from '@/lib/utils';

export function HomeHero({ anime }: { anime?: Anime }) {
  if (!anime) return null;

  const safeSlug = cleanSlug(anime.slug);

  return (
    <div className="relative h-[50vh] w-full -mt-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
        src={anime.poster}
        alt={`Poster for ${anime.title}`}
        className="object-cover w-full h-full"
        data-ai-hint="anime background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        <div className="container relative z-10 flex h-full items-end pb-8">
        <div className="max-w-xl space-y-2">
            <h1 className="font-headline text-2xl font-bold text-foreground">
            {anime.title}
            </h1>

            <div className="flex gap-2">
            <Button asChild size="sm">
                <Link href={`/watch/${anime.latestEpisode?.slug ?? safeSlug}`}>
                <PlayCircle />
                Play
                </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
                <Link href={`/anime/${safeSlug}`}>
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
