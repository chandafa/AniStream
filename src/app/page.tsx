import { getHomeData } from '@/lib/api';
import { AnimeList } from '@/components/anime/AnimeList';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { PopularToday } from '@/components/home/PopularToday';
import { OngoingAnimeList } from '@/components/home/OngoingAnimeList';
import { CompletedAnimeList } from '@/components/home/CompletedAnimeList';
import { HomeHero, HomeHeroSkeleton } from '@/components/home/HomeHero';
import { DonghuaList } from '@/components/home/DonghuaList';
import { ContinueWatching, ContinueWatchingSkeleton } from '@/components/home/ContinueWatching';
import { ViewingHistory, ViewingHistorySkeleton } from '@/components/home/ViewingHistory';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Home - Nonton Anime Sub Indo Terlengkap',
  description: 'Nonton anime subtitle Indonesia terbaru dan terlengkap. Streaming anime ongoing, completed, donghua, dan film anime berkualitas HD.',
  keywords: ['anime sub indo', 'nonton anime', 'streaming anime', 'anime subtitle indonesia', 'donghua sub indo', 'anime terbaru'],
  openGraph: {
    title: 'Home - Nonton Anime Sub Indo Terlengkap',
    description: 'Nonton anime subtitle Indonesia terbaru dan terlengkap',
    type: 'website',
  },
};

// Revalidate every 5 minutes (300 seconds) untuk data yang sering berubah
export const revalidate = 300;

async function HomeContent() {
  try {
    const homeData = await getHomeData();

    // Enhanced error handling
    if (!homeData) {
      return (
        <div className="container py-6">
          <HomeHeroSkeleton />
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Data</AlertTitle>
            <AlertDescription>
              Could not load anime data. This might be due to API issues. Please try again later or refresh the page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Prepare featured anime for hero section (ambil dari trending atau featured)
    const featuredAnime = homeData.featured && homeData.featured.length > 0 
      ? homeData.featured.slice(0, 5) 
      : homeData.trending?.slice(0, 5) ?? [];

    // Check if we have any data to display
    const hasAnyData = 
      (homeData.trending && homeData.trending.length > 0) ||
      (homeData.ongoing_anime && homeData.ongoing_anime.length > 0) ||
      (homeData.latest_episodes && homeData.latest_episodes.length > 0) ||
      (homeData.complete_anime && homeData.complete_anime.length > 0);

    if (!hasAnyData) {
      return (
        <div className="container py-6">
          <HomeHeroSkeleton />
          <Alert className="mt-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              No anime data is currently available. Our sources might be updating. Please check back shortly.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <>
        {/* Hero Section - Featured/Trending Anime */}
        {featuredAnime.length > 0 && (
          <Suspense fallback={<HomeHeroSkeleton />}>
            <HomeHero animes={featuredAnime} />
          </Suspense>
        )}
        
        <div className="container space-y-6 py-4 md:space-y-10 md:py-10">
          
          {/* Continue Watching - User specific, shows last watched episodes */}
          <Suspense fallback={<ContinueWatchingSkeleton />}>
            <ContinueWatching />
          </Suspense>

          {/* Latest Episodes - New releases from all sources */}
          {homeData.latest_episodes && homeData.latest_episodes.length > 0 && (
            <section aria-label="Latest Episode Releases">
              <AnimeList 
                title="Latest Episodes" 
                animes={homeData.latest_episodes}
                showEpisodeInfo={true}
                viewAllLink="/anime/latest"
              />
            </section>
          )}

          {/* Viewing History - User specific watch history */}
          <Suspense fallback={<ViewingHistorySkeleton />}>
            <ViewingHistory />
          </Suspense>

          {/* Trending/Popular Anime */}
          {homeData.trending && homeData.trending.length > 0 && (
            <section aria-label="Popular Anime Today">
              <PopularToday animes={homeData.trending.slice(0, 10)} />
            </section>
          )}

          {/* Ongoing Anime - Currently airing anime */}
          {homeData.ongoing_anime && homeData.ongoing_anime.length > 0 && (
            <section aria-label="Ongoing Anime">
              <OngoingAnimeList initialAnimes={homeData.ongoing_anime} />
            </section>
          )}

          {/* Featured Section - Jika ada data featured khusus */}
          {homeData.featured && homeData.featured.length > 0 && (
            <section aria-label="Featured Anime">
              <FeaturedSection animes={homeData.featured} />
            </section>
          )}

          {/* Donghua Section - Chinese anime */}
          <section aria-label="Donghua - Chinese Animation">
            <Suspense fallback={<AnimeListSkeleton title="Donghua" />}>
              <DonghuaList />
            </Suspense>
          </section>
          
          {/* Completed Anime - Finished series */}
          {homeData.complete_anime && homeData.complete_anime.length > 0 && (
            <section aria-label="Completed Anime">
              <CompletedAnimeList initialAnimes={homeData.complete_anime} />
            </section>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading home data:', error);
    
    return (
      <div className="container py-6">
        <HomeHeroSkeleton />
        <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Content</AlertTitle>
          <AlertDescription>
            An unexpected error occurred while loading the page. Please try refreshing or come back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

// Skeleton untuk AnimeList section
function AnimeListSkeleton({ title }: { title: string }) {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Complete page skeleton
function HomeSkeleton() {
  return (
    <>
      <HomeHeroSkeleton />
      <div className="container space-y-8 py-6 md:space-y-12 md:py-12">
        {/* Continue Watching Skeleton */}
        <ContinueWatchingSkeleton />
        
        {/* Latest Episodes Skeleton */}
        <AnimeListSkeleton title="Latest Episodes" />
        
        {/* Viewing History Skeleton */}
        <ViewingHistorySkeleton />
        
        {/* Popular Today Skeleton */}
        <div>
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Ongoing Anime Skeleton */}
        <AnimeListSkeleton title="Ongoing Anime" />
        
        {/* Donghua Skeleton */}
        <AnimeListSkeleton title="Donghua" />
        
        {/* Completed Anime Skeleton */}
        <AnimeListSkeleton title="Completed Anime" />
      </div>
    </>
  );
}

// Main page component
export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}