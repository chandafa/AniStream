import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanSlug(slug: string): string {
    if (!slug) return '';
    // Handle Otakudesu URLs specifically
    if (slug.includes('otakudesu.best/anime/')) {
        try {
            const url = new URL(slug);
            const pathParts = url.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1];
        } catch (e) {
            const parts = slug.split('/');
            return parts[parts.length - 1] || slug;
        }
    }
    // Handle Anichin URLs from Donghua API
    if (slug.startsWith('/anichin/')) {
        const parts = slug.split('/').filter(Boolean);
        // Assumes URL is like /anichin/anime/the-slug/ or /anichin/episode/the-slug/
        // We want the anime slug if present
        if (parts[0] === 'anichin' && parts[1] === 'anime' && parts[2]) {
            return parts[2];
        }
        // Fallback for episode URLs to try and find a base slug
        if (parts[0] === 'anichin' && parts[1] === 'episode') {
            // This is imperfect but better than failing completely.
            // 'renegade-immortal-episode-111-subtitle-indonesia' -> 'renegade-immortal'
            const episodeSlug = parts[2] || '';
            const match = episodeSlug.match(/^(.*?)(-season-\d+)?-episode-[\d-]+-subtitle-indonesia$/);
            if (match && match[1]) {
                return match[1];
            }
             // Fallback for slugs without 'episode' like 'tales-of-demons-and-gods-season-9-episode-31-35-subtitle-indonesia'
            const simpleMatch = episodeSlug.match(/^(.*?)-episode-.*$/);
            if (simpleMatch && simpleMatch[1]) {
                return simpleMatch[1];
            }
        }
    }

    // Default case for simple slugs
    return slug;
}
