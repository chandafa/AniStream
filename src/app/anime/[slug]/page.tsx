
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimeDetails } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, PlayCircle, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { toggleBookmark, isBookmarked } from '@/lib/user-data';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

type Props = {
  params: { slug: string };
};


// This is a client component, so we can't use generateMetadata directly.
// We'll set the title dynamically in the component.

export default function AnimeDetailPage({ params }: Props) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userData } = useDoc(userDocRef);

  const bookmarked = isBookmarked(userData, anime?.slug);

  useEffect(() => {
    async function fetchAnime() {
      setLoading(true);
      const animeData = await getAnimeDetails(params.slug);
      if (animeData) {
        setAnime(animeData);
        document.title = `${animeData.title} | OtakuStream`;
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchAnime();
  }, [params.slug]);


  const handleBookmark = async () => {
    if (!user || !firestore || !anime) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You need to be logged in to bookmark anime.',
      });
      return;
    }
    try {
      await toggleBookmark(firestore, user.uid, anime.slug);
      toast({
        title: bookmarked ? 'Bookmark Removed' : 'Bookmark Added',
        description: `${anime.title} has been ${bookmarked ? 'removed from' : 'added to'} your bookmarks.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update bookmarks.',
      });
    }
  };

  if (loading || !anime) {
    // You can return a skeleton loader here
    return <div>Loading...</div>;
  }

  const firstEpisode = anime.episode_lists?.[0];

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={anime.poster}
            alt={`Poster of ${anime.title}`}
            className="rounded-lg w-full shadow-lg"
            data-ai-hint="anime poster"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl font-bold">{anime.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {anime.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{anime.rating}</span>
                </div>
              )}
              {anime.status && <Badge variant="outline">{anime.status}</Badge>}
              {anime.type && <Badge variant="outline">{anime.type}</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre: any) => (
              <Button variant="secondary" size="sm" asChild key={genre.slug}>
                <Link href={`/search?genre=${genre.slug}`}>{genre.name}</Link>
              </Button>
            ))}
          </div>
          
          <div className="flex gap-4">
            {firstEpisode && (
              <Button asChild size="lg">
                  <Link href={`/watch/${firstEpisode.slug}`}>
                      <PlayCircle /> Watch First Episode
                  </Link>
              </Button>
            )}
            {user && (
              <Button variant="outline" size="lg" onClick={handleBookmark}>
                <Bookmark className={bookmarked ? 'fill-current' : ''} />
                {bookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
              </Button>
            )}
          </div>

          <div>
            <h2 className="font-headline text-2xl font-bold mb-2">Synopsis</h2>
            <p className="text-muted-foreground">{anime.synopsis}</p>
          </div>
        </div>
      </div>
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">Episodes</CardTitle>
        </CardHeader>
        <CardContent>
            {anime.episode_lists && anime.episode_lists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {anime.episode_lists.map((ep: any) => (
                        <Button variant="outline" asChild key={ep.slug}>
                            <Link href={`/watch/${ep.slug}`} className="truncate" title={ep.episode}>
                                Episode {ep.episode_number}
                            </Link>
                        </Button>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No episodes available yet.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
