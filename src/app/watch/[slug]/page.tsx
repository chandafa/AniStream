'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getEpisodeStream } from '@/lib/api';
import type { EpisodeStreamData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  
  const [data, setData] = useState<EpisodeStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentServerUrl, setCurrentServerUrl] = useState<string>('');

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEpisodeStream(slug);
        if (result && result.servers.length > 0) {
          setData(result);
          setCurrentServerUrl(result.servers[0].url);
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
  }, [slug, toast]);

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
  
  return (
    <div className="bg-black">
      <div className="aspect-video w-full max-h-screen">
        {currentServerUrl ? (
          <iframe
            src={currentServerUrl}
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

      <div className="container py-4 space-y-4">
        <div>
            {data.animeSlug && (
                <Button variant="ghost" asChild>
                    <Link href={`/anime/${data.animeSlug}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
                    </Link>
                </Button>
            )}
            <h1 className="font-headline text-2xl font-bold text-white">
                {data.currentEpisode || 'Watching Anime'}
            </h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">Server:</p>
            <Select
              onValueChange={(url) => setCurrentServerUrl(url)}
              defaultValue={currentServerUrl}
            >
              <SelectTrigger className="w-[180px] bg-card text-white">
                <SelectValue placeholder="Select Server" />
              </SelectTrigger>
              <SelectContent>
                {data.servers.map((server) => (
                  <SelectItem key={server.name} value={server.url}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={!data.prevEpisodeSlug} asChild>
              <Link href={data.prevEpisodeSlug ? `/watch/${data.prevEpisodeSlug}` : '#'}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Link>
            </Button>
            <Button variant="outline" disabled={!data.nextEpisodeSlug} asChild>
              <Link href={data.nextEpisodeSlug ? `/watch/${data.nextEpisodeSlug}` : '#'}>
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
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
