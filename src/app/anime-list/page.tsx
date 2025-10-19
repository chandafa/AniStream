
import type { Metadata } from 'next';
import Link from 'next/link';
import { sharedMetadata } from '@/lib/metadata';
import { getAllAnime } from '@/lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: 'Daftar Semua Anime',
  ...sharedMetadata,
};

export default async function AnimeListPage() {
  const animeGroups = await getAllAnime();

  if (!animeGroups) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Daftar Anime</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Gagal memuat daftar anime. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Daftar Semua Anime</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Jelajahi semua anime yang tersedia di OtakuStream.
        </p>
      </div>

      <Accordion type="multiple" className="w-full">
        {animeGroups.map((group) => (
          <AccordionItem value={group.startWith} key={group.startWith}>
            <AccordionTrigger className="text-2xl font-bold">
              {group.startWith}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                {group.animeList.map((anime) => (
                  <Link
                    href={`/anime/${anime.slug}`}
                    key={anime.slug}
                    className="block text-muted-foreground hover:text-primary hover:underline py-1"
                  >
                    {anime.title}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
