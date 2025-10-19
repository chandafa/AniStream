import { getCompletedAnime, getOngoingAnime } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sharedMetadata } from "@/lib/metadata";
import { AnimeList } from "@/components/anime/AnimeList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginatedAnime } from "@/lib/types";

type CategoryPageProps = {
  params: { type: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const type = params.type;
  let title = '';
  if (type === 'ongoing') {
    title = 'Ongoing';
  } else if (type === 'completed') {
    title = 'Completed';
  } else {
    title = type.charAt(0).toUpperCase() + type.slice(1);
  }
  return {
    title: `${title} Anime`,
    ...sharedMetadata,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const type = params.type;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  let title = '';
  if (type === 'ongoing') {
    title = 'Ongoing';
  } else if (type === 'completed') {
    title = 'Completed';
  } else {
    title = type.charAt(0).toUpperCase() + type.slice(1);
  }

  let data: PaginatedAnime | null;

  if (type === 'ongoing') {
    data = await getOngoingAnime(page);
  } else if (type === 'completed') {
    data = await getCompletedAnime(page);
  } else {
    notFound();
  }

  if (!data) {
    return (
        <div className="container py-8">
            <h1 className="font-headline text-4xl font-bold mb-8">{title} Anime</h1>
            <p>Could not load anime. Please try again later.</p>
        </div>
    )
  }

  return (
    <div className="container py-8">
      <AnimeList title={`${title} Anime`} animes={data.anime} />
      {data.pagination && (
        <Pagination
            currentPage={page}
            hasNextPage={data.pagination.hasNextPage}
            type={type}
        />
      )}
    </div>
  );
}

function Pagination({
    currentPage,
    hasNextPage,
    type,
  }: {
    currentPage: number;
    hasNextPage: boolean;
    type: string;
  }) {
    const prevPage = currentPage > 1 ? currentPage - 1 : 1;
    const nextPage = currentPage + 1;
  
    const buildLink = (page: number) => {
      let path = '';
      if (type === 'ongoing') {
        path = 'ongoing';
      } else if (type === 'completed') {
        path = 'completed';
      } else {
        path = type;
      }
      return `/category/${path}?page=${page}`;
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
