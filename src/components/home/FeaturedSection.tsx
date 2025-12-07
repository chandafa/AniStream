import { Anime } from '@/lib/types';
import { AnimeCard } from '@/components/anime/AnimeCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface FeaturedSectionProps {
  animes: Anime[];
  title?: string;
  viewAllLink?: string;
}

export function FeaturedSection({ 
  animes, 
  title = 'Featured Anime',
  viewAllLink
}: FeaturedSectionProps) {
  if (!animes || animes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animes.map((anime) => (
          <AnimeCard 
            key={anime.slug} 
            anime={anime}
            showRating={true}
            showStatus={true}
          />
        ))}
      </div>
    </div>
  );
}