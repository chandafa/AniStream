import {
  Anime,
  AnimeDetail,
  EpisodeStreamData,
  Genre,
  HomeData,
  PaginatedAnime,
} from './types';

const API_BASE_URL = 'https://www.sankavollerei.com/anime';

async function fetcher<T>(path: string, tags?: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/${path}`, {
      next: { revalidate: 3600, tags }, // Revalidate every hour
    });
    if (!res.ok) {
      console.error(`API fetch failed for path: ${path} with status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from API path: ${path}`, error);
    return null;
  }
}

export async function getHomeData(): Promise<HomeData | null> {
  return fetcher<HomeData>('home', ['home']);
}

export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
  return fetcher<AnimeDetail>(`anime/${slug}`, [`anime:${slug}`]);
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  return fetcher<EpisodeStreamData>(`episode/${slug}`, [`episode:${slug}`]);
}

export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
  return fetcher<PaginatedAnime>(`search/${keyword}?page=${page}`);
}

export async function getAnimeByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
  return fetcher<PaginatedAnime>(`genre/${slug}?page=${page}`);
}

export async function getGenres(): Promise<{genres: Genre[]} | null> {
    return fetcher<{genres: Genre[]}>('genre');
}

export async function getOngoingAnime(page: number = 1): Promise<PaginatedAnime | null> {
  return fetcher<PaginatedAnime>(`ongoing-anime?page=${page}`);
}

export async function getCompletedAnime(page: number = 1): Promise<PaginatedAnime | null> {
  return fetcher<PaginatedAnime>(`complete-anime/${page}`);
}
