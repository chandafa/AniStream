import type { Genre } from '@/lib/types';
import Link from 'next/link';

interface GenrePillsProps {
    genres: Genre[];
}

export function GenrePills({ genres }: GenrePillsProps) {
  return (
    <div className="flex items-center gap-2">
      {genres.map((genre, index) => (
        <div key={genre.slug} className="flex items-center gap-2">
          <Link href={`/search?genre=${genre.slug}`}>
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors">{genre.name}</span>
          </Link>
          {index < genres.length - 1 && <span className="text-muted-foreground/50">|</span>}
        </div>
      ))}
    </div>
  );
}
