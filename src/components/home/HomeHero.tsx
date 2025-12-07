// src/components/home/HomeHero.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListPlus, PlayCircle } from 'lucide-react';
import { cleanSlug } from '@/lib/utils';
import { GenrePills } from './GenrePills';
import { Skeleton } from '../ui/skeleton';
import Typewriter from 'typewriter-effect';
import { useState } from 'react';

export function HomeHeroSkeleton() {
    return (
        <div className="relative h-[60vh] w-full">
            <div className="absolute inset-0 overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="absolute inset-0 bg-background/50 backdrop-blur-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            
            <div className="container relative z-10 flex h-full items-center">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left animate-fade-in-up">
                    <Skeleton className="h-64 w-44 rounded-lg shadow-2xl" />
                    <div className="max-w-xl space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <div className="flex gap-4 justify-center md:justify-start">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function HomeHero({ animes }: { animes: Anime[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const staticAnime = animes[0]; // Used for static background and poster
    const currentAnime = animes[currentIndex];

    if (!staticAnime) return <HomeHeroSkeleton />;
    
    const animeTitles = animes.map(a => a.title);

    return (
    <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        {/* Background Image - Static */}
        <div className="absolute inset-0">
            <Image
                src={staticAnime.poster}
                alt={`Background for ${staticAnime.title}`}
                fill
                className="object-cover w-full h-full scale-110"
                priority
            />
            <div className="absolute inset-0 bg-background/50 backdrop-blur-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
        
        {/* Foreground Content */}
        <div className="container relative z-10 flex h-full items-center">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left animate-fade-in-up">
                {/* Poster - Static */}
                <div className="relative shrink-0">
                    <Image
                        src={staticAnime.poster}
                        alt={`Poster for ${staticAnime.title}`}
                        width={176}
                        height={256}
                        className="h-64 w-44 object-cover rounded-lg shadow-2xl shadow-black/50"
                        priority
                    />
                </div>
                
                {/* Details */}
                <div className="max-w-xl space-y-3 md:space-y-4">
                     <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground drop-shadow-lg h-24 md:h-36">
                        <Typewriter
                            options={{
                                strings: animeTitles,
                                autoStart: true,
                                loop: true,
                                delay: 50,
                                deleteSpeed: 20,
                                wrapperClassName: "font-headline text-3xl md:text-5xl font-bold text-foreground drop-shadow-lg",
                                cursorClassName: "font-headline text-3xl md:text-5xl font-bold text-primary drop-shadow-lg"
                            }}
                            onInit={(typewriter) => {
                                typewriter.callFunction(() => {
                                    const nextIndex = (currentIndex + 1) % animes.length;
                                    setCurrentIndex(nextIndex);
                                  }).start();
                            }}
                        />
                    </h1>
                   
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {currentAnime.status && <span className="mr-2 rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">{currentAnime.status}</span>}
                        {currentAnime.rating && <span className="mr-2">⭐ {currentAnime.rating}</span>}
                    </p>

                    <div className="flex gap-4 justify-center md:justify-start">
                        <Button asChild size="lg">
                            <Link href={currentAnime.latestEpisode ? `/watch/${cleanSlug(currentAnime.latestEpisode.slug)}` : `/anime/${cleanSlug(currentAnime.slug)}`}>
                            <PlayCircle />
                            Play
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg">
                            <Link href={`/anime/${cleanSlug(currentAnime.slug)}`}>
                            <ListPlus />
                            My List
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
