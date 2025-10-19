import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanSlug(slug: string): string {
    if (!slug) return '';
    if (slug.includes('otakudesu.best/anime/')) {
        try {
            const url = new URL(slug);
            const pathParts = url.pathname.split('/').filter(Boolean);
            return pathParts[pathParts.length - 1];
        } catch (e) {
            // Fallback for invalid URLs, though unlikely
            const parts = slug.split('/');
            return parts[parts.length - 1] || slug;
        }
    }
    return slug;
}
