// src/components/home/HomeHero.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListPlus, PlayCircle } from 'lucide-react';
import { cleanSlug } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCarousel } from './HomeCarousel';

export function HomeHero({ animes }: { animes: Anime[] }) {
    const isMobile = useIsMobile();
    const featuredAnime = animes[0];

    if (!featuredAnime) return null;

    if (isMobile) {
        return <HomeCarousel animes={animes} />
    }

    return (
    <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 overflow-hidden rounded-xl">
        <Image
            src={featuredAnime.poster}
            alt={`Poster for ${featuredAnime.title}`}
            fill
            className="object-cover w-full h-full"
            data-ai-hint="anime background"
            priority
        />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent rounded-xl" />
        <div className="container relative z-10 flex h-full items-end pb-16">
        <div className="max-w-xl space-y-4">
            <h1 className="font-headline text-5xl font-bold text-foreground">
            {featuredAnime.title}
            </h1>

            <div className="flex gap-4">
            <Button asChild size="lg">
                <Link href={featuredAnime.latestEpisode ? `/watch/${cleanSlug(featuredAnime.latestEpisode.slug)}` : `/anime/${cleanSlug(featuredAnime.slug)}`}>
                <PlayCircle />
                Play
                </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
                <Link href={`/anime/${cleanSlug(featuredAnime.slug)}`}>
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
