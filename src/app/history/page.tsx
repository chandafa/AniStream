import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { AnimeCard } from '@/components/anime/AnimeCard';
import type { Anime } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Viewing History',
  ...sharedMetadata,
};

const historyAnime: Anime[] = [
    { slug: '7', title: 'Cyberpunk Detective Story', poster: 'https://picsum.photos/seed/anime7/400/600', latestEpisode: {title: 'Ep 9', slug: '7'} },
    { slug: '8', title: 'Isekai RPG World', poster: 'https://picsum.photos/seed/anime8/400/600', latestEpisode: {title: 'Ep 11', slug: '8'} },
    { slug: '9', title: 'Magical Girl Chronicles', poster: 'https://picsum.photos/seed/anime9/400/600', latestEpisode: {title: 'Ep 50', slug: '9'} },
];


export default function HistoryPage() {
  return (
    <div className="container py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">Viewing History</h1>
      {historyAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {historyAnime.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Your viewing history is empty.</p>
          <p className="text-sm text-muted-foreground">Start watching to build your history.</p>
        </div>
      )}
    </div>
  );
}
