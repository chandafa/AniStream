

import { getAnimeByGenre, searchAnime } from "@/lib/api";
import { SearchClient } from "@/components/search/SearchClient";
import type { Metadata } from "next";
import { sharedMetadata } from "@/lib/metadata";
import { AnimeList } from "@/components/anime/AnimeList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  ...sharedMetadata,
};

type SearchPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : "";
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const resultsData = await (
    query
      ? searchAnime(query, page)
      : genre
      ? getAnimeByGenre(genre, page)
      : Promise.resolve(null)
  );

  let title = "Search";
  if (query) title = `Results for "${query}"`;
  else if (genre) title = `Genre: ${genre}`;

  return (
    <div className="container py-8">
      <SearchClient />
      <div className="mt-8">
        {resultsData && resultsData.anime.length > 0 ? (
          <>
            <AnimeList title={title} animes={resultsData.anime} />
            {resultsData.pagination && (resultsData.pagination.hasNextPage || resultsData.pagination.currentPage > 1) && (
              <Pagination
                currentPage={page}
                hasNextPage={resultsData.pagination.hasNextPage}
                query={query}
                genre={genre}
              />
            )}
          </>
        ) : (
          !query && !genre ? (
            <p className="text-center text-muted-foreground mt-16">
              Search for your favorite anime to get started.
            </p>
          ) : (
            <p className="text-center text-muted-foreground mt-16">
              No results found. Try a different search.
            </p>
          )
        )}
      </div>
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
