

import {
  Anime,
  AnimeDetail,
  Episode,
  EpisodeStreamData,
  Genre,
  HomeData,
  PaginatedAnime,
  ScheduleDay,
  UnlimitedAnimeResponse,
  AnimeGroup,
  DonghuaEpisodeStreamData,
  StreamServer,
  DownloadQuality,
} from './types';
import { cleanSlug } from './utils';
import axios from 'axios';

const API_BASE_URL = 'https://www.sankavollerei.com/anime';
const BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/samehadaku';
const THIRD_BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/animasu';
const FOURTH_BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/winbu';


async function fetcher<T>(path: string, tags?: string[], baseUrl: string = API_BASE_URL): Promise<T | null> {
  const fullUrl = path.startsWith('http') ? path : `${baseUrl}/${path}`;

  try {
    const res = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (res.status !== 200) {
      console.error(`API fetch failed for path: ${fullUrl} with status: ${res.status}`);
      return null;
    }
    
    return res.data;
  } catch (error) {
    console.error(`Error fetching from API path: ${fullUrl}`, error);
    return null;
  }
}

export async function getHomeData(): Promise<HomeData | null> {
  type HomeApiResponse = {
    data: {
      trending_anime: Anime[];
      ongoing_anime: Anime[];
      latest_episode_anime: Anime[];
      complete_anime: Anime[];
      featured?: Anime[];
    }
  };

  // 1. Try Primary API
  let data = await fetcher<HomeApiResponse>('home', ['home'], API_BASE_URL);
  
  // 2. If primary fails, try Backup API
  if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
    console.log("Primary API failed or returned no data. Trying backup API...");
    data = await fetcher<HomeApiResponse>('home', ['home'], BACKUP_API_BASE_URL);
  }

  // 3. If backup also fails, try Third Backup API
  if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
    console.log("Second API failed or returned no data. Trying third backup API...");
    data = await fetcher<HomeApiResponse>('home?page=1', ['home'], THIRD_BACKUP_API_BASE_URL);
  }

  // 4. If third backup also fails, try Fourth Backup API (Winbu)
  if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
    console.log("Third API failed or returned no data. Trying fourth backup API (Winbu)...");
    const winbuData = await fetcher<{ anime: Anime[] }>('home', ['home'], FOURTH_BACKUP_API_BASE_URL);
    if(winbuData && winbuData.anime) {
      return {
        trending: winbuData.anime,
        ongoing_anime: [],
        latest_episodes: [],
        complete_anime: [],
        featured: [],
        genres: [],
      }
    }
  }

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

const DONGHUA_API_BASE_URL = 'https://www.sankavollerei.com/anime/donghua';

export async function getDonghuaHome(page: number = 1): Promise<Anime[] | null> {
    const data = await fetcher<{ latest_release: Anime[] }>(`home/${page}`, ['donghua-home'], DONGHUA_API_BASE_URL);
    return data?.latest_release ?? null;
}

async function searchDonghua(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const response = await fetcher<{ data: Anime[] }>(`search/${keyword}/${page}`, [], DONGHUA_API_BASE_URL);
    return response?.data ?? [];
}

async function getDonghuaDetails(slug: string): Promise<AnimeDetail | null> {
    const donghuaData = await fetcher<AnimeDetail>(`detail/${slug}`, [`donghua:${slug}`], DONGHUA_API_BASE_URL);
    if (donghuaData) {
        if (!donghuaData.slug) {
            donghuaData.slug = slug;
        }
        return donghuaData;
    }
    return null;
}

async function getDonghuaEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<DonghuaEpisodeStreamData>(`episode/${slug}`, [`donghua-episode:${slug}`], DONGHUA_API_BASE_URL);

    if (!data) return null;
    
    const streamUrl = data.streaming?.main_url?.url ?? null;
    const animeSlug = data.donghua_details?.slug ? cleanSlug(data.donghua_details.slug) : cleanSlug(slug);
    
    const downloadLinks: DownloadQuality[] = [];
    if (data.download_url) {
      for (const key in data.download_url) {
        const qualityMatch = key.match(/download_url_(\d+p)/);
        if (qualityMatch) {
          const quality = qualityMatch[1];
          const providers = data.download_url[key];
          downloadLinks.push({
            quality: quality,
            links: Object.entries(providers).map(([provider, url]) => ({ provider, url }))
          });
        }
      }
    }


    return {
        episode: data.episode,
        stream_url: streamUrl,
        servers: data.streaming?.servers ?? [],
        downloadLinks: downloadLinks,
        anime: {
            slug: animeSlug
        },
        all_episodes: data.episodes_list ?? [],
        has_next_episode: !!data.navigation?.next_episode,
        next_episode: data.navigation?.next_episode ? { slug: data.navigation.next_episode.slug, episode: data.navigation.next_episode.episode } : null,
        has_previous_episode: !!data.navigation?.previous_episode,
        previous_episode: data.navigation?.previous_episode ? { slug: data.navigation.previous_episode.slug, episode: data.navigation.previous_episode.episode } : null,
    };
}

// --- Combined Functions ---

export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
    const safeSlug = cleanSlug(slug);
    
    // Prioritize Winbu API for detail fetching
    const winbuEndpoints = ['anime', 'series', 'film'];
    for (const endpoint of winbuEndpoints) {
        const winbuData = await fetcher<AnimeDetail>(`${endpoint}/${safeSlug}`, [`anime:${safeSlug}`], FOURTH_BACKUP_API_BASE_URL);
        if (winbuData && (winbuData.episode_lists || winbuData.episodes)) {
            if(!winbuData.episode_lists) winbuData.episode_lists = winbuData.episodes;
            return winbuData;
        }
    }

    const animeData = await fetcher<{ data: AnimeDetail }>(`anime/${safeSlug}`, [`anime:${safeSlug}`]);
    
    // Check if the standard anime endpoint returns valid data
    if (animeData && animeData.data && animeData.data.episode_lists && animeData.data.episode_lists.length > 0) {
      return animeData.data;
    }
  
    // If the standard anime endpoint fails or has no episodes, try the Donghua detail endpoint.
    try {
        const donghuaDetails = await getDonghuaDetails(safeSlug);
        if(donghuaDetails) {
            return donghuaDetails;
        }
    } catch (e) {
        console.error("Failed to fetch Donghua details, falling back to original data if available.", e);
    }
    
    // Fallback to original anime data even if it has no episodes
    if (animeData && animeData.data) {
        return animeData.data;
    }

    return null;
}

export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
  // Try Winbu API first
  const winbuData = await fetcher<EpisodeStreamData>(`episode/${slug}`, [`episode:${slug}`], FOURTH_BACKUP_API_BASE_URL);
  if (winbuData && winbuData.stream_url) {
      const animeDetails = await getAnimeDetails(winbuData.anime.slug);
      winbuData.all_episodes = animeDetails?.episode_lists ?? [];
      return winbuData;
  }
    
  // Try standard anime endpoint
  const animeData = await fetcher<{ data: EpisodeStreamData }>(`episode/${slug}`, [`episode:${slug}`]);

  if (animeData?.data) {
      const { data } = animeData;
      // Fetch all episodes for navigation
      const animeDetails = await getAnimeDetails(data.anime.slug);
      data.all_episodes = animeDetails?.episode_lists ?? [];

      if (data.stream_url) {
          if (!data.servers) {
            data.servers = [{ name: 'Default', url: data.stream_url }];
          }
          if (data.download_urls) {
            const downloadLinks: DownloadQuality[] = [];
            const formats = ['mp4', 'mkv'];
            formats.forEach(format => {
                if (data.download_urls![format as 'mp4' | 'mkv']) {
                    data.download_urls![format as 'mp4' | 'mkv']!.forEach(item => {
                        let qualityGroup = downloadLinks.find(q => q.quality === `${item.resolution} (${format.toUpperCase()})`);
                        if (!qualityGroup) {
                            qualityGroup = { quality: `${item.resolution} (${format.toUpperCase()})`, links: [] };
                            downloadLinks.push(qualityGroup);
                        }
                        qualityGroup.links.push(...item.urls);
                    });
                }
            });
            data.downloadLinks = downloadLinks;
          }
          return data;
      }
  }
  
  // If it fails or has no stream url, try donghua endpoint
  const donghuaData = await getDonghuaEpisodeStream(slug);
  if (donghuaData) {
      return donghuaData;
  }
  
  // As a last resort, try the mirror scraper if no other data is available.
  try {
    const mirrorRes = await axios.get(`/api/player/mirrors?query=${slug}`);
    if (mirrorRes.data.mirrors && mirrorRes.data.mirrors.length > 0) {
        const animeDetails = await getAnimeDetails(slug);
        const transformedMirrors: DownloadQuality[] = mirrorRes.data.mirrors
            .filter((m: any) => m.mirrors.length > 0)
            .map((m: any) => ({
                quality: m.quality,
                links: m.mirrors.map((mirror: any) => ({
                    provider: mirror.label,
                    url: `#`,
                    label: mirror.label,
                    data_content: mirror.data_content,
                }))
            }));
        
        return {
            episode: animeDetails?.title ? `${animeDetails.title} Episode` : slug, // Placeholder title
            stream_url: null,
            downloadLinks: transformedMirrors,
            anime: { slug },
            all_episodes: animeDetails?.episode_lists ?? [],
            has_next_episode: false,
            next_episode: null,
            has_previous_episode: false,
            previous_episode: null,
        }
    }
  } catch (e) {
    console.error("Mirror fetch API failed:", e);
  }

  return null;
}

export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
    // Fetch from multiple APIs
    const animePromise = fetcher<{ search_results: Anime[] }>(`search/${keyword}?page=${page}`);
    const donghuaPromise = searchDonghua(keyword, page);
    const winbuPromise = fetcher<{ anime: Anime[] }>(`search?q=${keyword}&page=${page}`, [], FOURTH_BACKUP_API_BASE_URL);


    const [animeRes, donghuaRes, winbuRes] = await Promise.all([animePromise, donghuaPromise, winbuPromise]);

    const anime = animeRes?.search_results ?? [];
    const donghua = donghuaRes ?? [];
    const winbu = winbuRes?.anime ?? [];
    
    // Combine and remove duplicates that might come from all APIs
    const combined = [...anime, ...donghua, ...winbu];
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

export async function getMovies(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ anime: Anime[], pagination: any }>(`film?page=${page}`, [], FOURTH_BACKUP_API_BASE_URL);
    if (!data || !data.anime) return null;
    
    return {
        anime: data.anime,
        pagination: {
            currentPage: page,
            hasNextPage: data.anime.length > 0, // Simple check
            totalPages: page + 1 // Assume there's always a next page if results are returned
        }
    }
}
