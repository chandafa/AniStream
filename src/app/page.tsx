import { getHomeData } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { PopularToday } from '@/components/home/PopularToday';
import { HomeCarousel } from '@/components/home/HomeCarousel';
import { HomeHero } from '@/components/home/HomeHero';
import { OngoingAnimeList } from '@/components/home/OngoingAnimeList';
import { CompletedAnimeList } from '@/components/home/CompletedAnimeList';

async function HomeContent() {
  const homeData = await getHomeData();

  if (!homeData) {
    return (
      <div className="container py-6">
        <p>Could not load data. Please try again later.</p>
      </div>
    );
  }

  const featuredAnime = homeData.featured ?? homeData.trending ?? [];

  return (
    <>
      {featuredAnime.length > 0 && (
        <>
          <div className="md:hidden">
            <HomeHero anime={featuredAnime[0]} />
          </div>
          <div className="hidden md:block">
            <HomeCarousel animes={featuredAnime} />
          </div>
        </>
      )}
      
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
      <Skeleton className="h-[50vh] md:h-[60vh] w-full rounded-none" />
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
