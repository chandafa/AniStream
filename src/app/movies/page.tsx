
import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import { getMovies } from '@/lib/api';
import { MovieList } from '@/components/movies/MovieList';

export const metadata: Metadata = {
  title: 'Movies',
  ...sharedMetadata,
};

export default async function MoviesPage() {
  const initialMovies = await getMovies(1);

  return (
    <div className="container py-8">
      <h1 className="font-headline text-4xl font-bold mb-8">Movies</h1>
      {initialMovies && initialMovies.anime.length > 0 ? (
        <MovieList initialMovies={initialMovies.anime} />
      ) : (
        <p>Could not load movies. Please try again later.</p>
      )}
    </div>
  );
}
