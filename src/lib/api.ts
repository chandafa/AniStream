
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
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error(`Error fetching from API path: ${path}`, error);
    return null;
  }
}

export async function getHomeData(): Promise<HomeData | null> {
  const data = await fetcher<{
    trending_anime: Anime[];
    ongoing_anime: Anime[];
    latest_episode_anime: Anime[];
    completed_anime: Anime[];
    featured?: Anime[];
  }>('home', ['home']);
  
  if (!data) return null;

  return {
    trending: data.trending_anime ?? [],
    ongoing_anime: data.ongoing_anime ?? [],
    latest_episodes: data.latest_episode_anime ?? [],
    completed_anime: data.completed_anime ?? [],
    featured: data.featured ?? [],
    genres: [],
  };
}


export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
  return fetcher<AnimeDetail>(`anime/${slug}`, [`anime:${slug}`]);
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  return fetcher<EpisodeStreamData>(`episode/${slug}`, [`episode:${slug}`]);
}

export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ search_results: Anime[] }>(`search/${keyword}?page=${page}`);
    if (!data || !data.search_results) {
        return {
            anime: [],
            pagination: {
                currentPage: 1,
                hasNextPage: false,
                totalPages: 1,
            }
        };
    }

    return {
        anime: data.search_results,
        pagination: {
            currentPage: page,
            hasNextPage: data.search_results.length > 0, // Assume there's a next page if results are returned
            totalPages: page + 1, // A guess
        }
    };
}

export async function getAnimeByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
  return fetcher<PaginatedAnime>(`genre/${slug}?page=${page}`);
}

export async function getOngoingAnime(page: number = 1): Promise<PaginatedAnime | null> {
  const data = await fetcher<{ paginationData: any, ongoingAnimeData: Anime[] }>(`ongoing-anime?page=${page}`);
  if (!data) return null;
  return {
    anime: data.ongoingAnimeData,
    pagination: {
      currentPage: data.paginationData.current_page,
      hasNextPage: data.paginationData.has_next_page,
      totalPages: data.paginationData.last_visible_page,
    }
  }
}

export async function getCompletedAnime(page: number = 1): Promise<PaginatedAnime | null> {
  const data = await fetcher<{ paginationData: any, completedAnimeData: Anime[] }>(`completed-anime?page=${page}`);
  if (!data) return null;
  return {
    anime: data.completedAnimeData,
    pagination: {
      currentPage: data.paginationData.current_page,
      hasNextPage: data.paginationData.has_next_page,
      totalPages: data.paginationData.last_visible_page,
    }
  }
}
