

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

// --- Donghua Specific Functions ---

export async function getDonghuaHome(page: number = 1): Promise<Anime[] | null> {
    const data = await fetcher<{ latest_release: Anime[] }>(`donghua/home/${page}`);
    return data?.latest_release ?? null;
}

async function searchDonghua(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const data = await fetcher<{ donghua: Anime[] }>(`donghua/search/${keyword}/${page}`);
    return data?.donghua ?? [];
}

async function getDonghuaDetails(slug: string): Promise<AnimeDetail | null> {
    const donghuaData = await fetcher<AnimeDetail>(`donghua/detail/${slug}`, [`donghua:${slug}`]);
    if (donghuaData) {
        if (!donghuaData.slug) {
            donghuaData.slug = slug;
        }
        return donghuaData;
    }
    return null;
}

async function getDonghuaEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<{
        episode: string;
        streaming: { main_url: { url: string } };
    }>(`donghua/episode/${slug}`, [`donghua-episode:${slug}`]);

    if (!data || !data.streaming || !data.streaming.main_url) return null;

    // Adapt the Donghua API response to the existing EpisodeStreamData structure
    return {
        episode: data.episode,
        stream_url: data.streaming.main_url.url,
        // Donghua API doesn't provide these, so we create fallback objects
        anime: {
            slug: cleanSlug(slug) // Extract anime slug from episode slug
        },
        has_next_episode: false,
        next_episode: null,
        has_previous_episode: false,
        previous_episode: null,
    };
}

// --- Combined Functions ---

export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
    const safeSlug = cleanSlug(slug);
    
    // First, try the standard anime endpoint
    const animeData = await fetcher<{ data: AnimeDetail }>(`anime/${safeSlug}`, [`anime:${safeSlug}`]);
    
    if (animeData && animeData.data) {
      return animeData.data;
    }
  
    // If the standard anime endpoint fails, try the Donghua detail endpoint.
    const donghuaDetails = await getDonghuaDetails(safeSlug);
    if(donghuaDetails) {
        return donghuaDetails;
    }
    
    // If both endpoints fail, return null.
    return null;
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  // Try standard anime endpoint first
  const animeData = await fetcher<{ data: EpisodeStreamData }>(`episode/${slug}`, [`episode:${slug}`]);
  if (animeData?.data?.stream_url) {
      return animeData.data;
  }
  
  // If it fails, try donghua endpoint
  const donghuaData = await getDonghuaEpisodeStream(slug);
  if (donghuaData?.stream_url) {
      return donghuaData;
  }

  return null;
}

export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
    // Fetch from both APIs
    const animePromise = fetcher<{ search_results: Anime[] }>(`search/${keyword}?page=${page}`);
    const donghuaPromise = searchDonghua(keyword, page);

    const [animeRes, donghuaRes] = await Promise.all([animePromise, donghuaPromise]);

    const anime = animeRes?.search_results ?? [];
    const donghua = donghuaRes ?? [];
    
    // Combine and remove duplicates that might come from both APIs
    const combined = [...anime, ...donghua];
    const uniqueAnimes = Array.from(new Map(combined.map(item => [item['slug'], item])).values());
    
    return {
        anime: uniqueAnimes,
        pagination: {
            currentPage: page,
            hasNextPage: uniqueAnimes.length > 0, // Basic assumption
            totalPages: page + (uniqueAnimes.length > 0 ? 1 : 0),
        }
    };
}

export async function getAllAnime(): Promise<AnimeGroup[] | null> {
    const data = await fetcher<UnlimitedAnimeResponse>(`unlimited`);
    if (!data || !data.data || !data.data.list) return null;
    
    return data.data.list.map(group => ({
        ...group,
        animeList: group.animeList.map(anime => ({
            slug: anime.animeId,
            title: anime.title,
            poster: '',
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
