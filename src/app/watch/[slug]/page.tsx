
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getEpisodeStream } from '@/lib/api';
import type { EpisodeStreamData, DownloadQuality } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Download, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addToHistory } from '@/lib/user-data';
import { cleanSlug } from '@/lib/utils';
import { EpisodeComments } from '@/components/anime/EpisodeComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import axios from 'axios';

export default function WatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [data, setData] = useState<EpisodeStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadQuality[]>([]);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEpisodeStream(slug);
        if (result) {
            setData(result);
            if (result.stream_url) {
                setCurrentStreamUrl(result.stream_url);
            }
          
          if (result.downloadLinks) {
              setDownloadLinks(result.downloadLinks)
          }

          const animeSlug = result.anime.slug ? cleanSlug(result.anime.slug) : null;
          if (user && firestore && animeSlug) {
            addToHistory(firestore, user.uid, animeSlug);
          }
        } else {
            // Try fetching from mirror API as a fallback for older episodes maybe
            try {
                const mirrorRes = await axios.get(`/api/player/mirrors?query=${slug}`);
                if (mirrorRes.data.mirrors && mirrorRes.data.mirrors.length > 0) {
                    const transformedMirrors: DownloadQuality[] = mirrorRes.data.mirrors
                        .filter((m: any) => m.mirrors.length > 0)
                        .map((m: any) => ({
                            quality: m.quality,
                            links: m.mirrors.map((mirror: any) => ({
                                provider: mirror.label,
                                url: `https://otakudesu.cloud/v/${mirror.data_content}`,
                                label: mirror.label,
                                data_content: mirror.data_content,
                            }))
                        }));
                    setDownloadLinks(transformedMirrors);
                }
            } catch (mirrorError) {
                console.error("Mirror fetch failed:", mirrorError);
            }

            if (!result?.stream_url && downloadLinks.length === 0) {
                 setError('No streaming servers or download links found for this episode.');
                 toast({
                    variant: "destructive",
                    title: "Not Found",
                    description: "No content could be found for this episode.",
                 });
            }
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
  }, [slug, toast, user, firestore, downloadLinks.length]);

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

  if (!data && downloadLinks.length === 0) {
    notFound();
  }
  
  const animeSlug = data ? cleanSlug(data.anime.slug) : null;

  return (
    <div className="bg-background text-foreground">
      <div className="relative w-full bg-black video-vignette">
        <div className="mx-auto max-w-5xl">
            <div className="aspect-video w-full">
                {currentStreamUrl ? (
                <iframe
                    src={currentStreamUrl}
                    allowFullScreen
                    className="w-full h-full"
                    title="Anime Video Player"
                    key={currentStreamUrl} // Force re-render on URL change
                ></iframe>
                ) : (
                <div className="w-full h-full bg-card flex items-center justify-center">
                    <p className="text-muted-foreground">Select a server or download option to start watching.</p>
                </div>
                )}
            </div>
        </div>
      </div>

      <div className="container py-4 space-y-4">
        <div>
            {animeSlug && (
                <Button variant="ghost" asChild className="mb-2 -ml-4">
                    <Link href={`/anime/${animeSlug}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
                    </Link>
                </Button>
            )}
            <div className="flex flex-col md:flex-row gap-2 justify-between md:items-center">
                <h1 className="font-headline text-xl md:text-2xl font-bold">
                    {data?.episode || 'Watching Anime'}
                </h1>
                {data && (
                  <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" disabled={!data.has_previous_episode} asChild>
                      <Link href={data.previous_episode ? `/watch/${data.previous_episode.slug}` : '#'}>
                          <ChevronLeft className="h-4 w-4" /> Prev
                      </Link>
                      </Button>
                      <Button variant="outline" size="sm" disabled={!data.has_next_episode} asChild>
                      <Link href={data.next_episode ? `/watch/${data.next_episode.slug}` : '#'}>
                          Next <ChevronRight className="h-4 w-4" />
                      </Link>
                      </Button>
                  </div>
                )}
            </div>
        </div>
        
        {data?.servers && data.servers.length > 1 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5" /> Streaming Servers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {data.servers.map((server) => (
                            <Button
                                key={server.name}
                                variant={currentStreamUrl === server.url ? 'default' : 'outline'}
                                onClick={() => setCurrentStreamUrl(server.url)}
                            >
                                {server.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {downloadLinks && downloadLinks.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="w-5 h-5" /> Download / Mirrors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {downloadLinks.map((qualityGroup) => (
                            <AccordionItem value={qualityGroup.quality} key={qualityGroup.quality}>
                                <AccordionTrigger>{qualityGroup.quality}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col items-start gap-2">
                                        {qualityGroup.links.map((link, index) => (
                                            <Button asChild variant="link" key={`${link.provider}-${index}`}>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                    {link.provider}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}

        <div className="py-6">
            <EpisodeComments episodeId={slug} />
        </div>
      </div>
    </div>
  );
}

function WatchPageSkeleton() {
    return (
        <div className="bg-background">
            <div className="bg-black">
                <div className="mx-auto max-w-5xl">
                    <Skeleton className="aspect-video w-full" />
                </div>
            </div>
            <div className="container py-4 space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
                 <div className="py-6">
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="py-6">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

    