import { Timestamp } from "firebase/firestore";

// Based on the provided API documentation and common anime API structures

export interface Anime {
  slug: string;
  title: string;
  poster: string;
  rating?: string;
  status?: string;
  type?: string;
  score?: string;
  release_date?: string;
  latestEpisode?: {
    title: string;
    slug: string;
  };
  current_episode?: string; // from ongoing_anime
  url?: string; // For Donghua API which contains the correct link
  thumbnail?: string; // Alternative to poster
  episode?: string; // For latest episodes
}

// Type for the raw anime item from the /unlimited endpoint
interface UnlimitedAnimeItem {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

// Type for a group of anime starting with a specific letter
export interface AnimeGroup {
  startWith: string;
  animeList: {
    title: string;
    slug: string; // Corresponds to animeId
    poster?: string;
  }[];
}

// Type for the full response from the /unlimited endpoint
export interface UnlimitedAnimeResponse {
  status: string;
  creator: string;
  statusCode: number;
  statusMessage: string;
  ok: boolean;
  data: {
    list: {
      startWith: string;
      animeList: UnlimitedAnimeItem[];
    }[];
  };
}

export interface HomeData {
  trending: Anime[];
  ongoing_anime: Anime[];
  latest_episodes: Anime[];
  complete_anime: Anime[];
  featured?: Anime[];
  genres: string[];
}

export interface Episode {
  episode: string; // e.g., "Sakamoto Days Part 2 Episode 1 Subtitle Indonesia"
  episode_number?: number; // Made optional as some APIs might not have it
  slug: string;
  title?: string; // For better episode identification
  release_date?: string;
}

export interface AnimeDetail extends Anime {
  synopsis: string;
  description?: string; // Alternative to synopsis
  genres: { name: string; slug: string }[];
  genre?: string[]; // Alternative format for genres
  episode_lists: Episode[];
  episodes?: Episode[]; // Alternative format for episodes (Winbu API)
  alter_title?: string;
  alternative_titles?: string[];
  japanese_title?: string;
  english_title?: string;
  episodes_count?: string;
  total_episodes?: number;
  duration?: string;
  season?: string;
  year?: string;
  studio?: string;
  producers?: string[];
  aired?: string;
  premiered?: string;
  broadcast?: string;
  source?: string;
  demographic?: string;
  rating_age?: string;
  trailer?: string;
  batch_link?: string; // For batch download
}

export interface StreamServer {
  name: string;
  url: string;
  label?: string; // Alternative to name
  quality?: string; // For server quality info
}

export interface DownloadLink {
  provider: string;
  url: string;
  label?: string;
  data_content?: string | null;
  host?: string; // Alternative to provider
  size?: string; // File size
}

export interface DownloadQuality {
  quality: string;
  links: DownloadLink[];
  mirrors?: any[];
  resolution?: string; // Alternative format
}

export interface EpisodeStreamData {
  episode: string;
  title?: string;
  anime: {
    slug: string;
    title?: string;
  };
  has_next_episode: boolean;
  next_episode: {
    slug: string;
    episode: string;
    title?: string;
  } | null;
  has_previous_episode: boolean;
  previous_episode: {
    slug: string;
    episode: string;
    title?: string;
  } | null;
  stream_url: string | null;
  servers?: StreamServer[];
  downloadLinks?: DownloadQuality[];
  all_episodes?: Episode[];
  download_urls?: {
    mp4?: { resolution: string; urls: { provider: string; url: string; data_content?: string | null; }[] }[];
    mkv?: { resolution: string; urls: { provider: string; url: string; data_content?: string | null; }[] }[];
  };
  download_links?: Record<string, DownloadLink[]>; // Alternative format
  release_date?: string;
  iframe_url?: string; // For embedded player
}

export interface DonghuaEpisodeStreamData {
  episode: string;
  title?: string;
  streaming: {
    main_url: {
      url: string;
      quality?: string;
    };
    servers: StreamServer[];
    alternative_servers?: StreamServer[];
  };
  download_url?: Record<string, Record<string, string>>;
  download_links?: Record<string, DownloadLink[]>;
  donghua_details: {
    slug: string;
    title?: string;
  };
  navigation: {
    previous_episode: {
      slug: string;
      episode: string;
      title?: string;
    } | null;
    next_episode: {
      slug: string;
      episode: string;
      title?: string;
    } | null;
  };
  episodes_list?: Episode[];
  all_episodes?: Episode[];
}

export interface Genre {
  name: string;
  slug: string;
  id?: string; // For some APIs
  count?: number; // Number of anime in genre
  description?: string;
}

export interface PaginatedAnime {
  anime: Anime[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
    lastVisiblePage?: number; // Alternative to totalPages
    perPage?: number;
    total?: number;
  };
}

export interface ScheduleAnime {
  anime_name: string;
  title?: string; // Alternative to anime_name
  slug: string;
  poster: string;
  thumbnail?: string; // Alternative to poster
  episode?: string;
  release_time?: string;
}

export interface ScheduleDay {
  day: string;
  anime_list: ScheduleAnime[];
  anime?: ScheduleAnime[]; // Alternative format
}

export interface Comment {
  id: string;
  episodeId: string;
  userId: string;
  username: string;
  userPhotoURL: string;
  text: string;
  timestamp: Timestamp;
  replies?: Comment[];
  likes?: number;
  parentId?: string;
}

export interface HistoryItem {
  animeSlug: string;
  episodeSlug: string;
  animeTitle?: string;
  episodeTitle?: string;
  poster?: string;
  watchedAt: Timestamp;
  progress?: number; // Watch progress percentage
  duration?: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  animeSlug: string;
  animeTitle: string;
  poster: string;
  addedAt: Timestamp;
  status?: 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';
  currentEpisode?: string;
  rating?: number;
  notes?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message?: string;
  statusMessage?: string;
  ok: boolean;
  data: T;
}

export interface ApiError {
  status: string;
  statusCode: number;
  message: string;
  error?: string;
}

// Search Related Types
export interface SearchResult {
  anime: Anime[];
  total?: number;
  query: string;
  page: number;
}

export interface AdvancedSearchParams {
  query?: string;
  genres?: string[];
  status?: 'ongoing' | 'completed' | 'upcoming';
  type?: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
  season?: string;
  year?: string;
  order?: 'popular' | 'latest' | 'update' | 'rating' | 'title';
  page?: number;
}

// Batch Download Types
export interface BatchDownload {
  anime: {
    slug: string;
    title: string;
  };
  batch_links: {
    quality: string;
    size?: string;
    format?: string;
    links: DownloadLink[];
  }[];
  description?: string;
  release_info?: string;
}

// Character Types (for Animasu)
export interface Character {
  name: string;
  slug: string;
  count?: number;
  description?: string;
}

// Server Embed Types
export interface ServerEmbed {
  url: string;
  type?: string;
  quality?: string;
  subtitle?: boolean;
}

// Catalog Filter Types (for Winbu)
export interface CatalogFilter {
  title?: string;
  page?: number;
  order?: 'popular' | 'update' | 'latest' | 'rating' | 'title';
  type?: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Series';
  status?: 'Currently Airing' | 'Finished Airing' | 'Not yet aired';
  genres?: string[];
  year?: string;
  season?: string;
}

// User Profile Types
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  bookmarks?: string[];
  history?: HistoryItem[];
  preferences?: {
    theme?: 'light' | 'dark';
    autoplay?: boolean;
    quality?: string;
    subtitle?: boolean;
  };
}