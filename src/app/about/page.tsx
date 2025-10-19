
import type { Metadata } from 'next';
import { sharedMetadata } from '@/lib/metadata';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us',
  ...sharedMetadata,
};

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">About AniStream</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your Ultimate Destination for Anime.
        </p>
      </div>
      <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square">
            <Image
                src="https://picsum.photos/seed/about/600/600"
                alt="Anime collage"
                fill
                className="rounded-lg object-cover"
                data-ai-hint="anime collage"
            />
        </div>
        <div className="space-y-4">
            <h2 className="font-headline text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground">
                At AniStream, we're passionate about anime. Our mission is to provide a modern, responsive, and high-performance platform for anime enthusiasts to discover, watch, and discuss their favorite shows. We believe in creating a seamless and engaging user experience that puts the content first.
            </p>
            <p className="text-muted-foreground">
                We're constantly working to improve our platform, adding new features, and expanding our library to bring you the best that the world of anime has to offer.
            </p>
            <h2 className="font-headline text-3xl font-bold mt-8">Our Technology</h2>
            <p className="text-muted-foreground">
                AniStream is built with the latest web technologies to ensure a fast and reliable experience. We leverage a powerful API to deliver a vast collection of anime directly to you. Our platform is fully responsive, so you can enjoy anime on your desktop, tablet, or smartphone.
            </p>
        </div>
      </div>
    </div>
  );
}
