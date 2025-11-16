
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getEpisodeStream } from '@/lib/api';
import type { Episode, EpisodeStreamData, DownloadQuality, DownloadLink } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Download, Server, Monitor, Loader2, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addToHistory } from '@/lib/user-data';
import { cleanSlug } from '@/lib/utils';
import { EpisodeComments } from '@/components/anime/EpisodeComments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [data, setData] = useState<EpisodeStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadQuality[]>([]);
  const [activeQuality, setActiveQuality] = useState<string | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [activeMirror, setActiveMirror] = useState<string | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);


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
            if (result.all_episodes) {
                setAllEpisodes(result.all_episodes);
            }
          
            let finalDownloadLinks: DownloadQuality[] = [];

            // Otakudesu API response
            if (result.download_urls?.mp4 || result.download_urls?.mkv) {
              const formats = ['mp4', 'mkv'];
              formats.forEach(format => {
                  if (result.download_urls![format as 'mp4' | 'mkv']) {
                      result.download_urls![format as 'mp4' | 'mkv']!.forEach(item => {
                          let qualityKey = `${item.resolution} (${format.toUpperCase()})`;
                          let qualityGroup = finalDownloadLinks.find(q => q.quality === qualityKey);
                          if (!qualityGroup) {
                              qualityGroup = { quality: qualityKey, links: [] };
                              finalDownloadLinks.push(qualityGroup);
                          }
                          qualityGroup.links.push(...item.urls);
                      });
                  }
              });
            }
             // Donghua API response
            else if (result.downloadLinks) {
                finalDownloadLinks = result.downloadLinks;
            }

            setDownloadLinks(finalDownloadLinks);

            // Set default active quality if none is set
            if (finalDownloadLinks.length > 0 && !activeQuality) {
              const firstGroup = finalDownloadLinks.find(q => q.quality.includes('mp4') || !q.quality.includes('mkv'));
              if(firstGroup) {
                  setActiveQuality(firstGroup.quality);
              } else {
                  setActiveQuality(finalDownloadLinks[0].quality)
              }
            }

            if (!result.stream_url && finalDownloadLinks.length === 0) {
                const mirrorRes = await axios.get(`/api/player/mirrors?query=${slug}`);
                if (mirrorRes.data.mirrors && mirrorRes.data.mirrors.length > 0) {
                    const transformedMirrors: DownloadQuality[] = mirrorRes.data.mirrors
                        .filter((m: any) => m.mirrors.length > 0)
                        .map((m: any) => ({
                            quality: m.quality,
                            links: m.mirrors.map((mirror: any) => ({
                                provider: mirror.label,
                                url: `#`, // URL is handled by handlePlay
                                label: mirror.label,
                                data_content: mirror.data_content,
                            }))
                        }));
                    setDownloadLinks(transformedMirrors);
                     if (transformedMirrors.length > 0) {
                        setActiveQuality(transformedMirrors[0].quality);
                    }
                } else {
                    setError('No streaming servers or download links found for this episode.');
                    toast({
                        variant: "destructive",
                        title: "Not Found",
                        description: "No content could be found for this episode.",
                    });
                }
            }

          const animeSlug = result.anime.slug ? cleanSlug(result.anime.slug) : null;
          if (user && firestore && animeSlug) {
            addToHistory(firestore, user.uid, animeSlug, slug);
          }
        } else {
             setError('No streaming servers or download links found for this episode.');
             toast({
                variant: "destructive",
                title: "Not Found",
                description: "No content could be found for this episode.",
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
  }, [slug, toast, user, firestore, activeQuality]);
  
  const handleQualityClick = (quality: string) => {
    setActiveQuality(prev => (prev === quality ? null : quality));
  };
  
  const handlePlay = async (mirror: DownloadLink) => {
    if (loadingPlayer) return;

    if (!mirror.data_content) {
        if(mirror.url.startsWith('http')) {
            setCurrentStreamUrl(mirror.url);
            setActiveMirror(mirror.label || mirror.provider);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'No data content available for this mirror.' });
        }
        return;
    }
    
    try {
      setLoadingPlayer(true);
      setActiveMirror(mirror.label || mirror.provider);
      const res = await axios.get(`/api/player/video?query=${encodeURIComponent(mirror.data_content)}`);
      if(res.data.player) {
        setCurrentStreamUrl(res.data.player);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load video from this source.' });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load player.' });
    } finally {
      setLoadingPlayer(false);
    }
  };

  const handleServerClick = (server: { name: string; url: string }) => {
    setCurrentStreamUrl(server.url);
    setActiveMirror(server.name);
  }

  const qualityColors: { [key: string]: string } = {
    "360": "bg-gray-600 hover:bg-gray-700",
    "480": "bg-blue-600 hover:bg-blue-700",
    "720": "bg-red-600 hover:bg-red-700",
    "1080": "bg-green-600 hover:bg-green-700",
  };

  const getQualityColor = (quality: string) => {
    const resolution = quality.match(/\d+/)?.[0];
    if (resolution && qualityColors[resolution]) {
        return qualityColors[resolution];
    }
    return "bg-gray-500 hover:bg-gray-600";
  }

  const onEpisodeChange = (newSlug: string) => {
    if (newSlug) {
      router.push(`/watch/${newSlug}`);
    }
  };


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
  
  const animeSlug = data ? cleanSlug(data.anime.slug) : null;
  const mp4DownloadLinks = downloadLinks.filter(q => q.quality.includes('mp4'));
  const mkvDownloadLinks = downloadLinks.filter(q => q.quality.includes('mkv'));

  return (
    <div className="bg-background text-foreground">
      <div className="relative w-full bg-black">
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
                    <p className="text-muted-foreground">Select a server to start watching.</p>
                </div>
                )}
            </div>
             {/* Mirror buttons container */}
             <div className="bg-gray-800/70 p-2 flex flex-wrap justify-center gap-2">
                {mp4DownloadLinks.map((qualityGroup) => (
                    <Button
                        key={qualityGroup.quality}
                        onClick={() => handleQualityClick(qualityGroup.quality)}
                        className={cn(
                            'text-white',
                            getQualityColor(qualityGroup.quality),
                            activeQuality === qualityGroup.quality ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''
                        )}
                        >
                        <Monitor className="mr-2 h-4 w-4" />
                        {qualityGroup.quality.replace('(MP4)', '').trim()}
                    </Button>
                ))}
             </div>
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* Active Mirror's Provider/Download Links */}
        {activeQuality && (
            <div className='my-4 p-4 bg-card rounded-lg'>
                <h3 className='text-lg font-bold mb-3 text-center'>Servers for {activeQuality}</h3>
                <div className='flex flex-wrap justify-center items-center gap-x-4 gap-y-2'>
                    {downloadLinks.find(q => q.quality === activeQuality)?.links.map((link, index) => {
                      const isActive = activeMirror === (link.label || link.provider);
                      const isLoading = loadingPlayer && isActive;
                      return (
                        <Button
                          key={`${link.provider}-${index}`}
                          onClick={() => handlePlay(link)}
                          disabled={isLoading}
                          variant="outline"
                          className={cn(isActive && "bg-primary text-primary-foreground")}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Server className="mr-2 h-4 w-4" />
                          )}
                          {link.provider || link.label}
                        </Button>
                      )
                    })}
                </div>
            </div>
        )}

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
                {allEpisodes && allEpisodes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <List className="h-5 w-5 text-muted-foreground" />
                        <Select onValueChange={onEpisodeChange} defaultValue={slug}>
                            <SelectTrigger className="w-full md:w-[250px]">
                                <SelectValue placeholder="Pilih Episode" />
                            </SelectTrigger>
                            <SelectContent>
                                {allEpisodes.map((episode) => (
                                <SelectItem key={episode.slug} value={episode.slug}>
                                    {episode.episode}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
        
        {data?.servers && data.servers.length > 1 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5" /> Backup Streaming Servers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {data.servers.map((server) => (
                            <Button
                                key={server.name}
                                variant={currentStreamUrl === server.url ? 'default' : 'outline'}
                                onClick={() => handleServerClick(server)}
                            >
                                {server.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {mkvDownloadLinks.length > 0 && (
            <Card>
                 <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="w-5 h-5" /> MKV Download Links
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mkvDownloadLinks.map((qualityGroup) => (
                         <div key={qualityGroup.quality}>
                            <h4 className="font-semibold text-md mb-2">{qualityGroup.quality}</h4>
                            <div className="flex flex-wrap gap-2">
                                {qualityGroup.links.map((link, index) => (
                                    <Button asChild variant="secondary" key={`${link.provider}-${index}`}>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            {link.provider}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
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
                     <div className="bg-gray-800/70 p-2 flex flex-wrap justify-center gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                     </div>
                </div>
            </div>
             <div className='container py-4 space-y-4'>
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

    