

import {
  Anime,
  AnimeDetail,
  EpisodeStreamData,
  Genre,
  HomeData,
  PaginatedAnime,
  ScheduleDay,
  UnlimitedAnimeResponse,
  AnimeGroup,
} from './types';
import { cleanSlug } from './utils';

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
    return json;
  } catch (error) {
    console.error(`Error fetching from API path: ${path}`, error);
    return null;
  }
}

export async function getHomeData(): Promise<HomeData | null> {
  const data = await fetcher<{
    data: {
      trending_anime: Anime[];
      ongoing_anime: Anime[];
      latest_episode_anime: Anime[];
      complete_anime: Anime[];
      featured?: Anime[];
    }
  }>('home', ['home']);
  
  if (!data || !data.data) return null;

  return {
    trending: data.data.trending_anime ?? [],
    ongoing_anime: data.data.ongoing_anime ?? [],
    latest_episodes: data.data.latest_episode_anime ?? [],
    complete_anime: data.data.complete_anime ?? [],
    featured: data.data.featured ?? [],
    genres: [],
  };
}

export async function getDonghuaHome(page: number = 1): Promise<Anime[] | null> {
    const data = await fetcher<{ latest_release: Anime[] }>(`donghua/home/${page}`);
    return data?.latest_release ?? null;
}


export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
    const safeSlug = cleanSlug(slug);
    
    // First, try the standard anime endpoint
    const animeData = await fetcher<{ data: AnimeDetail }>(`anime/${safeSlug}`, [`anime:${safeSlug}`]);
    
    if (animeData && animeData.data) {
      return animeData.data;
    }
  
    // If the standard anime endpoint fails, try the Donghua detail endpoint as a fallback
    console.log(`Failed to fetch from /anime/, trying /donghua/detail/ for slug: ${safeSlug}`);
    const donghuaData = await fetcher<AnimeDetail>(`donghua/detail/${safeSlug}`, [`donghua:${safeSlug}`]);

    // The Donghua detail response is the detail object itself, not nested under 'data'
    if (donghuaData) {
        // Manually add a slug property if it doesn't exist, for consistency
        if (!donghuaData.slug) {
            donghuaData.slug = safeSlug;
        }
        return donghuaData;
    }
    
    return null;
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  const data = await fetcher<{ data: EpisodeStreamData }>(`episode/${slug}`, [`episode:${slug}`]);
  return data?.data ?? null;
}

export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ search_results: Anime[] }>(`search/${keyword}?page=${page}`);
    // The search API doesn't provide pagination info, so we create a default one.
    // It also might return nothing, so we provide a default empty state.
    const anime = data?.search_results ?? [];
    return {
        anime: anime,
        pagination: {
            currentPage: page,
            hasNextPage: anime.length > 0, // Assume there's a next page if results are returned
            totalPages: page + (anime.length > 0 ? 1 : 0), // Basic assumption
        }
    };
}

export async function getAllAnime(): Promise<AnimeGroup[] | null> {
    const data = await fetcher<UnlimitedAnimeResponse>(`unlimited`);
    if (!data || !data.data || !data.data.list) return null;
    
    // The new structure is an array of groups, so we can return it directly.
    return data.data.list.map(group => ({
        ...group,
        animeList: group.animeList.map(anime => ({
            slug: anime.animeId,
            title: anime.title,
            poster: '', // The new endpoint doesn't provide a poster, so we'll leave it empty.
        }))
    }));
}


export async function getAnimeByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
  const data = await fetcher<{data: {anime: Anime[]}}>(`genre/${slug}?page=${page}`);
  if (!data || !data.data || !data.data.anime) {
    return {
      anime: [],
      pagination: {
        currentPage: page,
        hasNextPage: false,
        totalPages: page,
      }
    };
  }

  const anime = data.data.anime;

  return {
    anime: anime,
    pagination: {
      currentPage: page,
      hasNextPage: anime.length > 0,
      totalPages: page + (anime.length > 0 ? 1 : 0),
    },
  };
}

export async function getOngoingAnime(page: number = 1): Promise<PaginatedAnime | null> {
  const data = await fetcher<{ data: { paginationData: any, ongoingAnimeData: Anime[] } }>(`ongoing-anime?page=${page}`);
  if (!data || !data.data) return null;
  return {
    anime: data.data.ongoingAnimeData,
    pagination: {
      currentPage: data.data.paginationData.current_page,
      hasNextPage: data.data.paginationData.has_next_page,
      totalPages: data.data.paginationData.last_visible_page,
    }
  }
}

export async function getCompletedAnime(page: number = 1): Promise<PaginatedAnime | null> {
  const data = await fetcher<{ data: { paginationData: any, completeAnimeData: Anime[] } }>(`complete-anime/${page}`);
  if (!data || !data.data) return null;
  return {
    anime: data.data.completeAnimeData,
    pagination: {
      currentPage: data.data.paginationData.current_page,
      hasNextPage: data.data.paginationData.has_next_page,
      totalPages: data.data.paginationData.last_visible_page,
    }
  }
}

export async function getSchedule(): Promise<ScheduleDay[] | null> {
  const data = await fetcher<{ data: ScheduleDay[] }>('schedule', ['schedule']);
  return data?.data ?? null;
}

export async function getGenres(): Promise<Genre[] | null> {
    const data = await fetcher<{ data: Genre[] }>('genre', ['genres']);
    return data?.data ?? null;
}
