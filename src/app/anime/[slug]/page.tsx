import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimeDetails } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Star } from 'lucide-react';
import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const anime = await getAnimeDetails(params.slug);

  if (!anime) {
    return sharedMetadata;
  }

  return {
    title: anime.title,
    description: anime.synopsis,
  };
}


export default async function AnimeDetailPage({ params }: Props) {
  const anime = await getAnimeDetails(params.slug);

  if (!anime) {
    notFound();
  }

  const firstEpisode = anime.episode_lists?.[0];

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Image
            src={anime.poster}
            alt={`Poster of ${anime.title}`}
            width={400}
            height={600}
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
            {anime.genres.map((genre) => (
              <Button variant="secondary" size="sm" asChild key={genre.slug}>
                <Link href={`/search?genre=${genre.slug}`}>{genre.name}</Link>
              </Button>
            ))}
          </div>
          
          {firstEpisode && (
             <Button asChild size="lg">
                <Link href={`/watch/${firstEpisode.slug}`}>
                    <PlayCircle /> Watch First Episode
                </Link>
             </Button>
          )}

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
                    {anime.episode_lists.map((ep) => (
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
