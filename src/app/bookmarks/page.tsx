import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { AnimeCard } from '@/components/anime/AnimeCard';
import type { Anime } from '@/lib/types';

export const metadata: Metadata = {
  title: 'My Bookmarks',
  ...sharedMetadata,
};

const bookmarkedAnime: Anime[] = [
    { slug: '1', title: 'Action-Packed Adventure Series', poster: 'https://picsum.photos/seed/anime1/400/600', latestEpisode: {title: 'Ep 12', slug: '1'} },
    { slug: '2', title: 'Heartwarming Slice of Life', poster: 'https://picsum.photos/seed/anime2/400/600', latestEpisode: {title: 'Ep 10', slug: '2'} },
    { slug: '3', title: 'Epic Fantasy Saga', poster: 'https://picsum.photos/seed/anime3/400/600', latestEpisode: {title: 'Ep 24', slug: '3'} },
    { slug: '4', title: 'Mystery Thriller in Tokyo', poster: 'https://picsum.photos/seed/anime4/400/600', latestEpisode: {title: 'Ep 8', slug: '4'} },
    { slug: '5', title: 'Sci-Fi Space Opera', poster: 'https://picsum.photos/seed/anime5/400/600', latestEpisode: {title: 'Ep 13', slug: '5'} },
    { slug: '6', title: 'High School Romance Comedy', poster: 'https://picsum.photos/seed/anime6/400/600', latestEpisode: {title: 'Ep 12', slug: '6'} },
];

export default function BookmarksPage() {
  return (
    <div className="container py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">My Bookmarks</h1>
      {bookmarkedAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {bookmarkedAnime.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">You haven&apos;t bookmarked any anime yet.</p>
          <p className="text-sm text-muted-foreground">Start exploring and save your favorites!</p>
        </div>
      )}
    </div>
  );
}
