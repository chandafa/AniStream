


import { getAnimeByGenre, searchAnime } from "@/lib/api";
import { SearchClient } from "@/components/search/SearchClient";
import type { Metadata } from "next";
import { sharedMetadata } from "@/lib/metadata";
import { AnimeList } from "@/components/anime/AnimeList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Search",
  ...sharedMetadata,
};

type SearchPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

async function SearchResults({ query, genre, page }: { query?: string, genre?: string, page: number }) {
    const resultsData = await (
        query
          ? searchAnime(query, page)
          : genre
          ? getAnimeByGenre(genre, page)
          // If no query or genre, we don't fetch all anime here anymore.
          // The main search page will just show the search bars.
          : Promise.resolve(null)
      );
    
      let title = "";
      if (query) title = `Results for "${query}"`;
      else if (genre) title = `Genre: ${genre}`;
    
      if (!resultsData || resultsData.anime.length === 0) {
        return (
            <p className="text-center text-muted-foreground mt-16">
                {query || genre ? "No results found. Try a different search." : "Enter a search term or select a genre to begin."}
            </p>
        )
      }
    
      return (
        <div className="mt-8">
            <AnimeList title={title} animes={resultsData.anime} />
            {resultsData.pagination && (resultsData.pagination.hasNextPage || page > 1) && (
              <Pagination
                currentPage={page}
                hasNextPage={resultsData.pagination.hasNextPage}
                query={query}
                genre={genre}
              />
            )}
        </div>
      );
}

function SearchSkeleton() {
    return (
        <div className="mt-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
    )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : "";
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  return (
    <div className="container py-8">
      <SearchClient />
       <Suspense key={query + genre + page} fallback={<SearchSkeleton />}>
        <SearchResults query={query} genre={genre} page={page} />
      </Suspense>
    </div>
  );
}

function Pagination({
    currentPage,
    hasNextPage,
    query,
    genre,
  }: {
    currentPage: number;
    hasNextPage: boolean;
    query?: string;
    genre?: string;
  }) {
    const prevPage = currentPage > 1 ? currentPage - 1 : 1;
    const nextPage = currentPage + 1;
  
    const buildLink = (page: number) => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (genre) params.set('genre', genre);
      params.set('page', String(page));
      return `/search?${params.toString()}`;
    };
  
    return (
      <div className="flex justify-center items-center gap-4 mt-8">
        <Button variant="outline" disabled={currentPage <= 1} asChild>
          <Link href={buildLink(prevPage)}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>
        </Button>
        <span className="font-medium">Page {currentPage}</span>
        <Button variant="outline" disabled={!hasNextPage} asChild>
          <Link href={buildLink(nextPage)}>
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }
