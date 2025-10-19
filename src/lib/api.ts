

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
  DonghuaEpisodeStreamData,
  StreamServer,
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
    const response = await fetcher<{ data: Anime[] }>(`donghua/search/${keyword}/${page}`);
    return response?.data ?? [];
}

async function getDonghuaDetails(slug: string): Promise<AnimeDetail | null> {
    const donghuaData = await fetcher<AnimeDetail>(`donghua/detail/${slug}`, [`donghua:${slug}`]);
    if (donghuaData) {
        if (!donghuaData.slug) {
            donghuaData.slug = slug;
        }

        // Dynamically generate episode list if it doesn't exist
        if ((!donghuaData.episode_lists || donghuaData.episode_lists.length === 0) && donghuaData.episodes_count) {
            const countMatch = donghuaData.episodes_count.match(/\d+/);
            const episodeCount = countMatch ? parseInt(countMatch[0], 10) : 0;
            
            if (episodeCount > 0) {
                donghuaData.episode_lists = Array.from({ length: episodeCount }, (_, i) => {
                    const episodeNumber = i + 1;
                    const episodeSlug = `${slug}-episode-${episodeNumber}-subtitle-indonesia`;
                    return {
                        episode: `Episode ${episodeNumber}`,
                        episode_number: episodeNumber,
                        slug: episodeSlug,
                    };
                });
            }
        }
        return donghuaData;
    }
    return null;
}

async function getDonghuaEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<DonghuaEpisodeStreamData>(`donghua/episode/${slug}`, [`donghua-episode:${slug}`]);

    if (!data || !data.streaming || !data.streaming.main_url) return null;

    const animeSlug = data.donghua_details?.slug ? cleanSlug(data.donghua_details.slug) : cleanSlug(slug);

    return {
        episode: data.episode,
        stream_url: data.streaming.main_url.url,
        servers: data.streaming.servers,
        anime: {
            slug: animeSlug
        },
        has_next_episode: !!data.navigation.next_episode,
        next_episode: data.navigation.next_episode ? { slug: data.navigation.next_episode.slug } : null,
        has_previous_episode: !!data.navigation.previous_episode,
        previous_episode: data.navigation.previous_episode ? { slug: data.navigation.previous_episode.slug } : null,
    };
}

// --- Combined Functions ---

export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
    const safeSlug = cleanSlug(slug);
    
    const animeData = await fetcher<{ data: AnimeDetail }>(`anime/${safeSlug}`, [`anime:${safeSlug}`]);
    
    // Check if the standard anime endpoint returns valid data with episodes
    if (animeData && animeData.data && animeData.data.episode_lists && animeData.data.episode_lists.length > 0) {
      return animeData.data;
    }
  
    // If the standard anime endpoint fails or has no episodes, try the Donghua detail endpoint.
    const donghuaDetails = await getDonghuaDetails(safeSlug);
    if(donghuaDetails) {
        return donghuaDetails;
    }
    
    // Fallback to original anime data even if it has no episodes
    if (animeData && animeData.data) {
        return animeData.data;
    }

    return null;
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  // Try standard anime endpoint first
  const animeData = await fetcher<{ data: EpisodeStreamData }>(`episode/${slug}`, [`episode:${slug}`]);
  if (animeData?.data?.stream_url) {
      // Standard API might not provide a list of servers, so we create one from the main stream_url
      if (!animeData.data.servers) {
        animeData.data.servers = [{ name: 'Default', url: animeData.data.stream_url }];
      }
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
    const uniqueAnimes = Array.from(new Map(combined.map(item => [cleanSlug(item.slug), item])).values());
    
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
