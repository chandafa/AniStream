
import type { Metadata } from 'next';
import Link from 'next/link';
import { sharedMetadata } from '@/lib/metadata';
import { getSchedule, getDonghuaSchedule } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { ScheduleDay } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Jadwal Rilis',
  ...sharedMetadata,
};

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
    return (
        <Tabs defaultValue={scheduleData[0]?.day.toLowerCase()} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
                {scheduleData.map((day) => (
                    <TabsTrigger key={day.day} value={day.day.toLowerCase()}>{day.day}</TabsTrigger>
                ))}
            </TabsList>
            {scheduleData.map((day) => (
                <TabsContent key={day.day} value={day.day.toLowerCase()}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {day.anime_list && day.anime_list.map((anime) => (
                            <Link href={`/anime/${anime.slug}`} key={anime.slug} className="group">
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-[2/3] w-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={anime.poster}
                                                alt={`Poster of ${anime.anime_name}`}
                                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                                data-ai-hint="anime poster"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                                <h3 className="mt-2 text-sm font-semibold text-center group-hover:text-primary transition-colors line-clamp-2">
                                    {anime.anime_name}
                                </h3>
                            </Link>
                        ))}
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="donghua">Donghua</TabsTrigger>
        </TabsList>
        <TabsContent value="anime">
          <ScheduleTabContent scheduleData={animeSchedule} />
        </TabsContent>
        <TabsContent value="donghua">
          <ScheduleTabContent scheduleData={donghuaSchedule} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
