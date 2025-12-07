
import type { Metadata } from 'next';
import Link from 'next/link';
import { sharedMetadata } from '@/lib/metadata';
import { getSchedule, getDonghuaSchedule } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { ScheduleDay, ScheduleAnime } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Jadwal Rilis',
  ...sharedMetadata,
};

function ScheduleCard({ anime }: { anime: ScheduleAnime }) {
    return (
        <Link href={`/anime/${anime.slug}`} key={anime.slug} className="group">
            <Card className="overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex-grow">
                    <div className="relative aspect-[2/3] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={anime.poster}
                            alt={`Poster of ${anime.anime_name}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            data-ai-hint="anime poster"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                         {anime.release_time && (
                            <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1">
                                <Clock className="h-3 w-3"/>
                                {anime.release_time}
                            </Badge>
                         )}
                         {anime.episode && (
                            <Badge variant="secondary" className="absolute bottom-2 right-2">
                                {anime.episode.replace("Episode ", "Eps ")}
                            </Badge>
                         )}
                    </div>
                </CardContent>
            </Card>
            <h3 className="mt-2 text-sm font-semibold text-center group-hover:text-primary transition-colors line-clamp-2">
                {anime.anime_name}
            </h3>
        </Link>
    );
}


function ScheduleTabContent({ scheduleData }: { scheduleData: ScheduleDay[] | null }) {
    if (!scheduleData) {
        return (
            <div className="text-center py-10">
                <p className="mt-4 text-lg text-muted-foreground">
                    Gagal memuat jadwal. Silakan coba lagi nanti.
                </p>
            </div>
        );
    }
    
    // Find today's day to set as default tab
    const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
    const defaultDay = scheduleData.find(d => d.day.toLowerCase() === today.toLowerCase())?.day.toLowerCase() || scheduleData[0]?.day.toLowerCase();

    return (
        <Tabs defaultValue={defaultDay} className="w-full">
            <div className="relative">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="grid w-max grid-cols-7 mx-auto">
                        {scheduleData.map((day) => (
                            <TabsTrigger key={day.day} value={day.day.toLowerCase()}>{day.day}</TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            {scheduleData.map((day) => (
                <TabsContent key={day.day} value={day.day.toLowerCase()}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
                        {day.anime_list && day.anime_list.length > 0 ? (
                             day.anime_list.map((anime) => (
                                <ScheduleCard key={anime.slug} anime={anime} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                <p>Tidak ada jadwal rilis untuk hari ini.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}

export default async function SchedulePage() {
    const [animeSchedule, donghuaSchedule] = await Promise.all([
        getSchedule(),
        getDonghuaSchedule()
    ]);

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Jadwal Rilis</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Jadwal rilis anime dan donghua terbaru setiap harinya.
        </p>
      </div>

      <Tabs defaultValue="anime" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="donghua">Donghua</TabsTrigger>
        </TabsList>
        <TabsContent value="anime" className="mt-6">
          <ScheduleTabContent scheduleData={animeSchedule} />
        </TabsContent>
        <TabsContent value="donghua" className="mt-6">
          <ScheduleTabContent scheduleData={donghuaSchedule} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
