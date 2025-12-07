
import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { getMovies } from '@/lib/api';
import { MovieList } from '@/components/movies/MovieList';

export const metadata: Metadata = {
  title: 'Movies',
  ...sharedMetadata,
};

export default async function MoviesCategoryPage() {
  const initialMovies = await getMovies(1);

  return (
    <div className="container py-8">
      {initialMovies && initialMovies.anime.length > 0 ? (
        <MovieList initialMovies={initialMovies.anime} />
      ) : (
        <p>Could not load movies. Please try again later.</p>
      )}
    </div>
  );
}

    