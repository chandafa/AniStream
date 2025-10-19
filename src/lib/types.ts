
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
    episode_number: number;
    slug: string;
}

export interface AnimeDetail extends Anime {
  synopsis: string;
  genres: { name: string; slug: string }[];
  episode_lists: Episode[];
}

export interface StreamServer {
  name: string;
  url: string;
}

export interface EpisodeStreamData {
  episode: string;
  anime: {
    slug: string;
  };
  has_next_episode: boolean;
  next_episode: {
    slug: string;
  } | null;
  has_previous_episode: boolean;
  previous_episode: {
    slug: string;
  } | null;
  stream_url: string;
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

    