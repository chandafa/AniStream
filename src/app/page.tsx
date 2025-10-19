import { getHomeData } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { PopularToday } from '@/components/home/PopularToday';
import { OngoingAnimeList } from '@/components/home/OngoingAnimeList';
import { CompletedAnimeList } from '@/components/home/CompletedAnimeList';
import type { Anime } from '@/lib/types';
import { HomeHero } from '@/components/home/HomeHero';
import { DonghuaList } from '@/components/home/DonghuaList';


const staticCarouselData: Anime[] = [
    {
      title: 'Epic Adventure in a Fantasy World',
      slug: 'featured-1',
      poster: 'https://picsum.photos/seed/carousel1/1280/720',
      latestEpisode: { slug: 'watch/featured-1-ep-1', title: 'Episode 1' }
    },
    {
      title: 'High School Slice of Life',
      slug: 'featured-2',
      poster: 'https://picsum.photos/seed/carousel2/1280/720',
      latestEpisode: { slug: 'watch/featured-2-ep-1', title: 'Episode 1' }
    },
    {
      title: 'Sci-Fi Thriller: The Last Hope',
      slug: 'featured-3',
      poster: 'https://picsum.photos/seed/carousel3/1280/720',
      latestEpisode: { slug: 'watch/featured-3-ep-1', title: 'Episode 1' }
    },
  ];

async function HomeContent() {
  const homeData = await getHomeData();

  if (!homeData) {
    return (
      <div className="container py-6">
        <p>Could not load data. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <div className='container pt-4'>
        <HomeHero animes={staticCarouselData} />
      </div>
      
      <div className="container space-y-6 py-4 md:space-y-10 md:py-10">
        
        {homeData.latest_episodes && homeData.latest_episodes.length > 0 && (
          <AnimeList title="New Release" animes={homeData.latest_episodes} />
        )}

        {homeData.ongoing_anime && homeData.ongoing_anime.length > 0 && (
          <OngoingAnimeList initialAnimes={homeData.ongoing_anime} />
        )}

        {homeData.trending && homeData.trending.length > 0 && (
          <PopularToday animes={homeData.trending.slice(0, 5)} />
        )}

        <DonghuaList />
        
        {homeData.complete_anime && homeData.complete_anime.length > 0 && (
          <CompletedAnimeList initialAnimes={homeData.complete_anime} />
        )}
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className='container pt-4'>
        <Skeleton className="h-[50vh] md:h-[60vh] w-full rounded-xl" />
      </div>
      <div className="container space-y-12 py-12">
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
