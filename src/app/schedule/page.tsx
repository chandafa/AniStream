import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'Jadwal Rilis',
  ...sharedMetadata,
};

export default function SchedulePage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Jadwal Rilis</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Fitur ini sedang dalam pengembangan. Pantau terus untuk pembaruan!
        </p>
      </div>
    </div>
  );
}
