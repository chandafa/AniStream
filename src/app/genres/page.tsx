
import type { Metadata } from 'next';
import Link from 'next/link';
import { sharedMetadata } from '@/lib/metadata';
import { getGenres } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Daftar Genre',
  ...sharedMetadata,
};

export default async function GenresPage() {
  const genres = await getGenres();

  if (!genres) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Daftar Genre</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Gagal memuat daftar genre. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Daftar Genre</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Jelajahi anime berdasarkan genre favorit Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Genre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button asChild variant="outline" key={genre.slug}>
                <Link href={`/search?genre=${genre.slug}`}>
                  {genre.name}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
