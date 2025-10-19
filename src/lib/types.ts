// Based on the provided API documentation and common anime API structures

export interface Anime {
  slug: string;
  title: string;
  poster: string;
  rating?: string;
  status?: string;
  type?: string;
  latestEpisode?: {
    title: string;
    slug: string;
  };
}

export interface HomeData {
  trending: Anime[];
  ongoing: Anime[];
  latest: Anime[];
  completed: Anime[];
  featured?: Anime[];
  genres: string[];
}

export interface Episode {
  slug: string;
  title: string;
  episode: string; // e.g., "Episode 1"
}

export interface AnimeDetail extends Anime {
  synopsis: string;
  genres: { name: string; slug: string }[];
  episodes: Episode[];
}

export interface StreamServer {
  name: string;
  url: string;
}

export interface EpisodeStreamData {
  servers: StreamServer[];
  nextEpisodeSlug?: string;
  prevEpisodeSlug?: string;
  animeSlug?: string;
  currentEpisode?: string;
}

export interface Genre {
  name: string;
  slug: string;
}

export interface PaginatedAnime {
  anime: Anime[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
  };
}
