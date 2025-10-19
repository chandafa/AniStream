

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getEpisodeStream } from '@/lib/api';
import type { EpisodeStreamData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addToHistory } from '@/lib/user-data';
import { cleanSlug } from '@/lib/utils';
import { EpisodeComments } from '@/components/anime/EpisodeComments';

function extractAnimeSlug(otakudesuUrl: string): string | null {
    try {
        const url = new URL(otakudesuUrl);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'anime' && pathParts[1]) {
            return pathParts[1];
        }
        return null;
    } catch (e) {
        console.error("Invalid URL for slug extraction", otakudesuUrl);
        return null;
    }
}

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [data, setData] = useState<EpisodeStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEpisodeStream(slug);
        if (result && result.stream_url) {
          setData(result);
          const animeSlug = extractAnimeSlug(result.anime.slug);
          if (user && firestore && animeSlug) {
            // Add to history without waiting
            addToHistory(firestore, user.uid, animeSlug);
          }
        } else {
          setError('No streaming servers found for this episode.');
          toast({
            variant: "destructive",
            title: "Streaming Error",
            description: "No streaming servers could be found.",
          });
        }
      } catch (e) {
        setError('Failed to load episode data. Please try again.');
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load episode data. Please try again later.",
          });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, toast, user, firestore]);

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    notFound();
  }
  
  const animeSlug = cleanSlug(data.anime.slug);

  return (
    <div className="bg-black">
      <div className="aspect-video w-full max-h-screen">
        {data.stream_url ? (
          <iframe
            src={data.stream_url}
            allowFullScreen
            className="w-full h-full"
            title="Anime Video Player"
          ></iframe>
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center">
            <p className="text-muted-foreground">Select a server to start watching.</p>
          </div>
        )}
      </div>

      <div className="container py-4 space-y-4 text-white">
        <div>
            {animeSlug && (
                <Button variant="ghost" asChild>
                    <Link href={`/anime/${animeSlug}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
                    </Link>
                </Button>
            )}
            <h1 className="font-headline text-2xl font-bold">
                {data.episode || 'Watching Anime'}
            </h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className='w-full md:w-auto'></div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!data.has_previous_episode} asChild>
              <Link href={data.previous_episode ? `/watch/${data.previous_episode.slug}` : '#'}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Link>
            </Button>
            <Button variant="outline" disabled={!data.has_next_episode} asChild>
              <Link href={data.next_episode ? `/watch/${data.next_episode.slug}` : '#'}>
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="py-6">
            <EpisodeComments episodeId={slug} />
        </div>
      </div>
    </div>
  );
}

function WatchPageSkeleton() {
    return (
      <div className="bg-black">
        <Skeleton className="aspect-video w-full" />
        <div className="container py-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

    