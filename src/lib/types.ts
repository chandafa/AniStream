
import { Timestamp } from "firebase/firestore";

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
  current_episode?: string; // from ongoing_anime
  url?: string; // For Donghua API which contains the correct link
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
    episode_number?: number; // Made optional as Donghua API might not have it
    slug: string;
}

export interface AnimeDetail extends Anime {
  synopsis: string;
  genres: { name: string; slug: string }[];
  episode_lists?: Episode[];
  episodes?: Episode[]; // for winbu and other apis
  alter_title?: string;
  episodes_count?: string;
}

export interface StreamServer {
  name: string;
  url: string;
}

export interface DownloadLink {
  provider: string;
  url: string;
  label?: string;
  data_content?: string | null;
}

export interface DownloadQuality {
  quality: string;
  links: DownloadLink[];
  mirrors?: any[];
}


export interface EpisodeStreamData {
  episode: string;
  anime: {
    slug: string;
  };
  has_next_episode: boolean;
  next_episode: {
    slug: string;
    episode: string;
  } | null;
  has_previous_episode: boolean;
  previous_episode: {
    slug: string;
    episode: string;
  } | null;
  stream_url: string | null;
  servers?: StreamServer[];
  downloadLinks?: DownloadQuality[];
  all_episodes?: Episode[];
  download_urls?: {
    mp4?: { resolution: string; urls: { provider: string; url: string; data_content?: string | null; }[] }[];
    mkv?: { resolution: string; urls: { provider: string; url: string; data_content?: string | null; }[] }[];
  };
}

export interface DonghuaEpisodeStreamData {
    episode: string;
    streaming: {
        main_url: {
            url: string;
        };
        servers: StreamServer[];
    },
    download_url?: Record<string, Record<string, string>>;
    donghua_details: {
        slug: string;
    },
    navigation: {
        previous_episode: {
            slug: string;
            episode: string;
        } | null,
        next_episode: {
            slug: string;
            episode: string;
        } | null
    },
    episodes_list?: Episode[];
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

export interface ScheduleAnime {
    anime_name: string;
    slug: string;
    poster: string;
}

export interface ScheduleDay {
    day: string;
    anime_list: ScheduleAnime[];
}

export interface Comment {
    id: string;
    episodeId: string;
    userId: string;
    username: string;
    userPhotoURL: string;
    text: string;
    timestamp: Timestamp;
}

export interface HistoryItem {
    animeSlug: string;
    episodeSlug: string;
    watchedAt: Timestamp;
}
