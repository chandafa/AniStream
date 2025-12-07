import { Anime } from '@/lib/types';
import { AnimeCard } from '@/components/anime/AnimeCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface AnimeListProps {
  title: string;
  animes: Anime[];
  showEpisodeInfo?: boolean;
  viewAllLink?: string;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function AnimeList({ 
  title, 
  animes, 
  showEpisodeInfo = false,
  viewAllLink,
  className = '',
  columns = {
    default: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  }
}: AnimeListProps) {
  if (!animes || animes.length === 0) return null;

  const gridCols = `grid-cols-${columns.default} sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      
      <div className={`grid ${gridCols} gap-4`}>
        {animes.map((anime) => (
          <AnimeCard 
            key={anime.slug} 
            anime={anime}
            showEpisodeInfo={showEpisodeInfo}
          />
        ))}
      </div>
    </div>
  );
}