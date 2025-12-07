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
  import { wrapper } from 'axios-cookiejar-support';
  import { CookieJar } from 'tough-cookie';
  
  const API_BASE_URL = 'https://www.sankavollerei.com/anime';
  const BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/samehadaku';
  const THIRD_BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/animasu';
  const FOURTH_BACKUP_API_BASE_URL = 'https://www.sankavollerei.com/anime/winbu';
  const DONGHUA_API_BASE_URL = 'https://www.sankavollerei.com/anime/donghua';
  
  async function fetcher<T>(path: string, tags?: string[], baseUrl: string = API_BASE_URL): Promise<T | null> {
    const fullUrl = path.startsWith('http') ? path : `${baseUrl}/${path}`;
  
    try {
      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar }));
      
      const res = await client.get(fullUrl, {
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
  
    // 1. Try Primary API (Otakudesu via Sankavollerei)
    let data = await fetcher<HomeApiResponse>('home', ['home'], API_BASE_URL);
    
    // 2. If primary fails, try Samehadaku API
    if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
      console.log("Primary API failed or returned no data. Trying Samehadaku API...");
      const samehadakuData = await fetcher<{ data: { popular: Anime[], ongoing: Anime[], latest: Anime[] } }>('home', ['home'], BACKUP_API_BASE_URL);
      if (samehadakuData?.data) {
        return {
          trending: samehadakuData.data.popular ?? [],
          ongoing_anime: samehadakuData.data.ongoing ?? [],
          latest_episodes: samehadakuData.data.latest ?? [],
          complete_anime: [],
          featured: [],
          genres: [],
        };
      }
    }
  
    // 3. If Samehadaku also fails, try Animasu API
    if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
      console.log("Samehadaku API failed. Trying Animasu API...");
      const animasuData = await fetcher<{ data: { popular: Anime[], ongoing: Anime[], latest: Anime[] } }>('home?page=1', ['home'], THIRD_BACKUP_API_BASE_URL);
      if (animasuData?.data) {
        return {
          trending: animasuData.data.popular ?? [],
          ongoing_anime: animasuData.data.ongoing ?? [],
          latest_episodes: animasuData.data.latest ?? [],
          complete_anime: [],
          featured: [],
          genres: [],
        };
      }
    }
  
    // 4. If Animasu also fails, try Winbu API
    if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
      console.log("Animasu API failed. Trying Winbu API...");
      const winbuData = await fetcher<{ data: { anime: Anime[] } }>('home', ['home'], FOURTH_BACKUP_API_BASE_URL);
      if (winbuData?.data?.anime) {
        return {
          trending: winbuData.data.anime,
          ongoing_anime: [],
          latest_episodes: [],
          complete_anime: [],
          featured: [],
          genres: [],
        };
      }
    }
  
    // 5. Last resort: try Donghua API
    if (!data || !data.data || !data.data.trending_anime || data.data.trending_anime.length === 0) {
      console.log("Winbu API failed. Trying Donghua API as last resort...");
      const donghuaData = await fetcher<{ data: { latest_release: Anime[] } }>('home/1', ['home'], DONGHUA_API_BASE_URL);
      if (donghuaData?.data?.latest_release) {
        return {
          trending: donghuaData.data.latest_release,
          ongoing_anime: [],
          latest_episodes: donghuaData.data.latest_release,
          complete_anime: [],
          featured: [],
          genres: [],
        };
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
  
  export async function getDonghuaHome(page: number = 1): Promise<Anime[] | null> {
    const data = await fetcher<{ data: { latest_release: Anime[] } }>(`home/${page}`, ['donghua-home'], DONGHUA_API_BASE_URL);
    return data?.data?.latest_release ?? null;
  }
  
  export async function getOngoingDonghua(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { donghua: Anime[], pagination: any } }>(`ongoing/${page}`, ['donghua-ongoing'], DONGHUA_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.donghua ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.donghua?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getCompletedDonghua(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { donghua: Anime[], pagination: any } }>(`completed/${page}`, ['donghua-completed'], DONGHUA_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.donghua ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.donghua?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getLatestDonghua(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { donghua: Anime[], pagination: any } }>(`latest/${page}`, ['donghua-latest'], DONGHUA_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.donghua ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.donghua?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  async function searchDonghua(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const response = await fetcher<{ data: Anime[] }>(`search/${encodeURIComponent(keyword)}/${page}`, [], DONGHUA_API_BASE_URL);
    return response?.data ?? [];
  }
  
  async function getDonghuaDetails(slug: string): Promise<AnimeDetail | null> {
    const donghuaData = await fetcher<{ data: AnimeDetail }>(`detail/${slug}`, [`donghua:${slug}`], DONGHUA_API_BASE_URL);
    if (donghuaData?.data) {
      if (!donghuaData.data.slug) {
        donghuaData.data.slug = slug;
      }
      return donghuaData.data;
    }
    return null;
  }
  
  async function getDonghuaEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<{ data: DonghuaEpisodeStreamData }>(`episode/${slug}`, [`donghua-episode:${slug}`], DONGHUA_API_BASE_URL);
  
    if (!data?.data) return null;
    
    const episodeData = data.data;
    const streamUrl = episodeData.streaming?.main_url?.url ?? null;
    const animeSlug = episodeData.donghua_details?.slug ? cleanSlug(episodeData.donghua_details.slug) : cleanSlug(slug);
    
    const downloadLinks: DownloadQuality[] = [];
    if (episodeData.download_url) {
      for (const key in episodeData.download_url) {
        const qualityMatch = key.match(/download_url_(\d+p)/);
        if (qualityMatch) {
          const quality = qualityMatch[1];
          const providers = episodeData.download_url[key];
          downloadLinks.push({
            quality: quality,
            links: Object.entries(providers).map(([provider, url]) => ({ provider, url }))
          });
        }
      }
    }
  
    return {
      episode: episodeData.episode ?? slug,
      stream_url: streamUrl,
      servers: episodeData.streaming?.servers ?? [],
      downloadLinks: downloadLinks,
      anime: {
        slug: animeSlug
      },
      all_episodes: episodeData.episodes_list ?? [],
      has_next_episode: !!episodeData.navigation?.next_episode,
      next_episode: episodeData.navigation?.next_episode ? { 
        slug: episodeData.navigation.next_episode.slug, 
        episode: episodeData.navigation.next_episode.episode 
      } : null,
      has_previous_episode: !!episodeData.navigation?.previous_episode,
      previous_episode: episodeData.navigation?.previous_episode ? { 
        slug: episodeData.navigation.previous_episode.slug, 
        episode: episodeData.navigation.previous_episode.episode 
      } : null,
    };
  }
  
  export async function getDonghuaSchedule(): Promise<ScheduleDay[] | null> {
    const data = await fetcher<{ data: { schedule: ScheduleDay[] } }>(`schedule`, ['donghua-schedule'], DONGHUA_API_BASE_URL);
    return data?.data?.schedule ?? null;
  }
  
  export async function getDonghuaGenres(): Promise<Genre[] | null> {
    const data = await fetcher<{ data: { genres: Genre[] } }>(`genres`, ['donghua-genres'], DONGHUA_API_BASE_URL);
    return data?.data?.genres ?? null;
  }
  
  export async function getDonghuaByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { donghua: Anime[], pagination: any } }>(`genres/${slug}/${page}`, ['donghua-genre'], DONGHUA_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.donghua ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.donghua?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  // --- Samehadaku Specific Functions ---
  
  async function searchSamehadaku(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const response = await fetcher<{ data: { anime: Anime[] } }>(`search?q=${encodeURIComponent(keyword)}&page=${page}`, [], BACKUP_API_BASE_URL);
    return response?.data?.anime ?? [];
  }
  
  async function getSamehadakuDetails(slug: string): Promise<AnimeDetail | null> {
    const data = await fetcher<{ data: AnimeDetail }>(`anime/${slug}`, [`samehadaku:${slug}`], BACKUP_API_BASE_URL);
    if (data?.data) {
      if (!data.data.slug) {
        data.data.slug = slug;
      }
      return data.data;
    }
    return null;
  }
  
  async function getSamehadakuEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<{ data: any }>(`episode/${slug}`, [`samehadaku-episode:${slug}`], BACKUP_API_BASE_URL);
    
    if (!data?.data) return null;
    
    const episodeData = data.data;
    const streamUrl = episodeData.stream_url ?? episodeData.streaming?.main_url?.url ?? null;
    
    const downloadLinks: DownloadQuality[] = [];
    if (episodeData.download_links) {
      Object.entries(episodeData.download_links).forEach(([quality, links]: [string, any]) => {
        if (Array.isArray(links)) {
          downloadLinks.push({
            quality: quality,
            links: links.map(link => ({
              provider: link.provider || link.host || 'Unknown',
              url: link.url
            }))
          });
        }
      });
    }
  
    return {
      episode: episodeData.episode ?? episodeData.title ?? slug,
      stream_url: streamUrl,
      servers: episodeData.servers ?? [],
      downloadLinks: downloadLinks,
      anime: {
        slug: episodeData.anime?.slug ?? slug.split('-episode-')[0]
      },
      all_episodes: episodeData.all_episodes ?? [],
      has_next_episode: !!episodeData.next_episode,
      next_episode: episodeData.next_episode,
      has_previous_episode: !!episodeData.previous_episode,
      previous_episode: episodeData.previous_episode,
    };
  }
  
  // --- Animasu Specific Functions ---
  
  async function searchAnimasu(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const response = await fetcher<{ data: { anime: Anime[] } }>(`search/${encodeURIComponent(keyword)}?page=${page}`, [], THIRD_BACKUP_API_BASE_URL);
    return response?.data?.anime ?? [];
  }
  
  async function getAnimasuDetails(slug: string): Promise<AnimeDetail | null> {
    const data = await fetcher<{ data: AnimeDetail }>(`detail/${slug}`, [`animasu:${slug}`], THIRD_BACKUP_API_BASE_URL);
    if (data?.data) {
      if (!data.data.slug) {
        data.data.slug = slug;
      }
      return data.data;
    }
    return null;
  }
  
  async function getAnimasuEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<{ data: any }>(`episode/${slug}`, [`animasu-episode:${slug}`], THIRD_BACKUP_API_BASE_URL);
    
    if (!data?.data) return null;
    
    const episodeData = data.data;
    const streamUrl = episodeData.stream_url ?? episodeData.streaming?.main_url?.url ?? null;
    
    const downloadLinks: DownloadQuality[] = [];
    if (episodeData.download_links) {
      Object.entries(episodeData.download_links).forEach(([quality, links]: [string, any]) => {
        if (Array.isArray(links)) {
          downloadLinks.push({
            quality: quality,
            links: links.map(link => ({
              provider: link.provider || link.host || 'Unknown',
              url: link.url
            }))
          });
        }
      });
    }
  
    return {
      episode: episodeData.episode ?? episodeData.title ?? slug,
      stream_url: streamUrl,
      servers: episodeData.servers ?? [],
      downloadLinks: downloadLinks,
      anime: {
        slug: episodeData.anime?.slug ?? slug.split('-episode-')[0]
      },
      all_episodes: episodeData.all_episodes ?? [],
      has_next_episode: !!episodeData.next_episode,
      next_episode: episodeData.next_episode,
      has_previous_episode: !!episodeData.previous_episode,
      previous_episode: episodeData.previous_episode,
    };
  }
  
  // --- Winbu Specific Functions ---
  
  async function searchWinbu(keyword: string, page: number = 1): Promise<Anime[] | null> {
    const response = await fetcher<{ data: { anime: Anime[] } }>(`search?q=${encodeURIComponent(keyword)}&page=${page}`, [], FOURTH_BACKUP_API_BASE_URL);
    return response?.data?.anime ?? [];
  }
  
  async function getWinbuDetails(slug: string): Promise<AnimeDetail | null> {
    // Winbu has different endpoints for anime, series, and film
    const endpoints = ['anime', 'series', 'film'];
    
    for (const endpoint of endpoints) {
      const data = await fetcher<{ data: AnimeDetail }>(`${endpoint}/${slug}`, [`winbu:${slug}`], FOURTH_BACKUP_API_BASE_URL);
      if (data?.data && (data.data.episode_lists || data.data.episodes)) {
        if (!data.data.episode_lists && data.data.episodes) {
          data.data.episode_lists = data.data.episodes;
        }
        if (!data.data.slug) {
          data.data.slug = slug;
        }
        return data.data;
      }
    }
    return null;
  }
  
  async function getWinbuEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    const data = await fetcher<{ data: any }>(`episode/${slug}`, [`winbu-episode:${slug}`], FOURTH_BACKUP_API_BASE_URL);
    
    if (!data?.data) return null;
    
    const episodeData = data.data;
    const streamUrl = episodeData.stream_url ?? null;
    
    const downloadLinks: DownloadQuality[] = [];
    if (episodeData.download_links) {
      Object.entries(episodeData.download_links).forEach(([quality, links]: [string, any]) => {
        if (Array.isArray(links)) {
          downloadLinks.push({
            quality: quality,
            links: links.map(link => ({
              provider: link.provider || link.host || 'Unknown',
              url: link.url
            }))
          });
        }
      });
    }
  
    return {
      episode: episodeData.episode ?? episodeData.title ?? slug,
      stream_url: streamUrl,
      servers: episodeData.servers ?? [],
      downloadLinks: downloadLinks,
      anime: {
        slug: episodeData.anime?.slug ?? slug
      },
      all_episodes: episodeData.all_episodes ?? [],
      has_next_episode: !!episodeData.next_episode,
      next_episode: episodeData.next_episode,
      has_previous_episode: !!episodeData.previous_episode,
      previous_episode: episodeData.previous_episode,
    };
  }
  
  // --- Combined Functions ---
  
  export async function getAnimeDetails(slug: string): Promise<AnimeDetail | null> {
    const safeSlug = cleanSlug(slug);
    
    // Try all APIs in parallel for better performance
    const [otakudesuData, winbuData, donghuaData, samehadakuData, animasuData] = await Promise.all([
      fetcher<{ data: AnimeDetail }>(`anime/${safeSlug}`, [`anime:${safeSlug}`]),
      getWinbuDetails(safeSlug),
      getDonghuaDetails(safeSlug),
      getSamehadakuDetails(safeSlug),
      getAnimasuDetails(safeSlug)
    ]);
  
    // Return the first successful response with episode data
    if (otakudesuData?.data && otakudesuData.data.episode_lists && otakudesuData.data.episode_lists.length > 0) {
      return otakudesuData.data;
    }
    
    if (winbuData && (winbuData.episode_lists || winbuData.episodes)) {
      return winbuData;
    }
    
    if (donghuaData && donghuaData.episode_lists && donghuaData.episode_lists.length > 0) {
      return donghuaData;
    }
    
    if (samehadakuData && samehadakuData.episode_lists && samehadakuData.episode_lists.length > 0) {
      return samehadakuData;
    }
    
    if (animasuData && animasuData.episode_lists && animasuData.episode_lists.length > 0) {
      return animasuData;
    }
  
    // Fallback to any available data even without episodes
    return otakudesuData?.data ?? winbuData ?? donghuaData ?? samehadakuData ?? animasuData ?? null;
  }
  
  export async function getEpisodeStream(slug: string): Promise<EpisodeStreamData | null> {
    // Try all APIs in parallel
    const [otakudesuData, winbuData, donghuaData, samehadakuData, animasuData] = await Promise.all([
      fetcher<{ data: EpisodeStreamData }>(`episode/${slug}`, [`episode:${slug}`]),
      getWinbuEpisodeStream(slug),
      getDonghuaEpisodeStream(slug),
      getSamehadakuEpisodeStream(slug),
      getAnimasuEpisodeStream(slug)
    ]);
  
    // Process Otakudesu data
    if (otakudesuData?.data) {
      const { data } = otakudesuData;
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
  
    // Return first successful response
    if (winbuData && winbuData.stream_url) {
      const animeDetails = await getAnimeDetails(winbuData.anime.slug);
      winbuData.all_episodes = animeDetails?.episode_lists ?? [];
      return winbuData;
    }
  
    if (donghuaData && donghuaData.stream_url) {
      return donghuaData;
    }
  
    if (samehadakuData && samehadakuData.stream_url) {
      return samehadakuData;
    }
  
    if (animasuData && animasuData.stream_url) {
      return animasuData;
    }
  
    // Last resort: try mirror scraper
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
          episode: animeDetails?.title ? `${animeDetails.title} Episode` : slug,
          stream_url: null,
          downloadLinks: transformedMirrors,
          anime: { slug },
          all_episodes: animeDetails?.episode_lists ?? [],
          has_next_episode: false,
          next_episode: null,
          has_previous_episode: false,
          previous_episode: null,
        };
      }
    } catch (e) {
      console.error("Mirror fetch API failed:", e);
    }
  
    return null;
  }
  
  export async function searchAnime(keyword: string, page: number = 1): Promise<PaginatedAnime | null> {
    // Search all APIs in parallel
    const [otakudesuRes, donghuaRes, samehadakuRes, animasuRes, winbuRes] = await Promise.all([
      fetcher<{ data: { search_results: Anime[] } }>(`search/${encodeURIComponent(keyword)}?page=${page}`),
      searchDonghua(keyword, page),
      searchSamehadaku(keyword, page),
      searchAnimasu(keyword, page),
      searchWinbu(keyword, page)
    ]);
  
    const otakudesu = otakudesuRes?.data?.search_results ?? [];
    const donghua = donghuaRes ?? [];
    const samehadaku = samehadakuRes ?? [];
    const animasu = animasuRes ?? [];
    const winbu = winbuRes ?? [];
    
    const combined = [...otakudesu, ...donghua, ...samehadaku, ...animasu, ...winbu];
    const uniqueAnimes = Array.from(new Map(combined.map(item => [cleanSlug(item.slug), item])).values());
    
    return {
      anime: uniqueAnimes,
      pagination: {
        currentPage: page,
        hasNextPage: uniqueAnimes.length > 0,
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
    const data = await fetcher<{ data: { anime: Anime[] } }>(`genre/${slug}?page=${page}`);
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
    };
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
    };
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
    // Try Winbu film endpoint first
    const winbuData = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`film?page=${page}`, [], FOURTH_BACKUP_API_BASE_URL);
    if (winbuData?.data?.anime) {
      return {
        anime: winbuData.data.anime,
        pagination: {
          currentPage: page,
          hasNextPage: winbuData.data.anime.length > 0,
          totalPages: page + 1 
        }
      };
    }
  
    // Fallback to Samehadaku movies
    const samehadakuData = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`movies?page=${page}`, [], BACKUP_API_BASE_URL);
    if (samehadakuData?.data?.anime) {
      return {
        anime: samehadakuData.data.anime,
        pagination: {
          currentPage: page,
          hasNextPage: samehadakuData.data.anime.length > 0,
          totalPages: page + 1 
        }
      };
    }
  
    // Fallback to Animasu movies
    const animasuData = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`movies?page=${page}`, [], THIRD_BACKUP_API_BASE_URL);
    if (animasuData?.data?.anime) {
      return {
        anime: animasuData.data.anime,
        pagination: {
          currentPage: page,
          hasNextPage: animasuData.data.anime.length > 0,
          totalPages: page + 1 
        }
      };
    }
  
    return null;
  }
  
  // --- Winbu Additional Functions ---
  
  export async function getWinbuSchedule(day?: string): Promise<ScheduleDay[] | null> {
    const endpoint = day ? `schedule?day=${day}` : 'schedule';
    const data = await fetcher<{ data: { schedule: ScheduleDay[] } }>(endpoint, ['winbu-schedule'], FOURTH_BACKUP_API_BASE_URL);
    return data?.data?.schedule ?? null;
  }
  
  export async function getWinbuGenres(): Promise<Genre[] | null> {
    const data = await fetcher<{ data: { genres: Genre[] } }>('genres', ['winbu-genres'], FOURTH_BACKUP_API_BASE_URL);
    return data?.data?.genres ?? null;
  }
  
  export async function getWinbuByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`genre/${slug}?page=${page}`, ['winbu-genre'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getWinbuOngoing(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`ongoing?page=${page}`, ['winbu-ongoing'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getWinbuCompleted(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`completed?page=${page}`, ['winbu-completed'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getWinbuPopular(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`populer?page=${page}`, ['winbu-popular'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getWinbuLatest(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`latest?page=${page}`, ['winbu-latest'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getWinbuUpdate(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`update?page=${page}`, ['winbu-update'], FOURTH_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  // --- Samehadaku Additional Functions ---
  
  export async function getSamehadakuRecent(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`recent?page=${page}`, ['samehadaku-recent'], BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getSamehadakuPopular(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`popular?page=${page}`, ['samehadaku-popular'], BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getSamehadakuOngoing(page: number = 1, order?: string): Promise<PaginatedAnime | null> {
    const endpoint = order ? `ongoing?page=${page}&order=${order}` : `ongoing?page=${page}`;
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(endpoint, ['samehadaku-ongoing'], BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getSamehadakuCompleted(page: number = 1, order?: string): Promise<PaginatedAnime | null> {
    const endpoint = order ? `completed?page=${page}&order=${order}` : `completed?page=${page}`;
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(endpoint, ['samehadaku-completed'], BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getSamehadakuGenres(): Promise<Genre[] | null> {
    const data = await fetcher<{ data: { genres: Genre[] } }>('genres', ['samehadaku-genres'], BACKUP_API_BASE_URL);
    return data?.data?.genres ?? null;
  }
  
  export async function getSamehadakuByGenre(genreId: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`genres/${genreId}?page=${page}`, ['samehadaku-genre'], BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  // --- Animasu Additional Functions ---
  
  export async function getAnimasuPopular(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`popular?page=${page}`, ['animasu-popular'], THIRD_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getAnimasuOngoing(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`ongoing?page=${page}`, ['animasu-ongoing'], THIRD_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getAnimasuCompleted(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`completed?page=${page}`, ['animasu-completed'], THIRD_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getAnimasuLatest(page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`latest?page=${page}`, ['animasu-latest'], THIRD_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getAnimasuGenres(): Promise<Genre[] | null> {
    const data = await fetcher<{ data: { genres: Genre[] } }>('genres', ['animasu-genres'], THIRD_BACKUP_API_BASE_URL);
    return data?.data?.genres ?? null;
  }
  
  export async function getAnimasuByGenre(slug: string, page: number = 1): Promise<PaginatedAnime | null> {
    const data = await fetcher<{ data: { anime: Anime[], pagination: any } }>(`genre/${slug}?page=${page}`, ['animasu-genre'], THIRD_BACKUP_API_BASE_URL);
    if (!data?.data) return null;
    return {
      anime: data.data.anime ?? [],
      pagination: {
        currentPage: page,
        hasNextPage: (data.data.anime?.length ?? 0) > 0,
        totalPages: page + 1
      }
    };
  }
  
  export async function getAnimasuSchedule(): Promise<ScheduleDay[] | null> {
    const data = await fetcher<{ data: { schedule: ScheduleDay[] } }>('schedule', ['animasu-schedule'], THIRD_BACKUP_API_BASE_URL);
    return data?.data?.schedule ?? null;
  }