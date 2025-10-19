
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-12">
      <TriangleAlert className="w-24 h-24 text-primary mb-4" />
      <h1 className="font-headline text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold mt-2 mb-4">Page Not Found</h2>
      <p className="max-w-md text-muted-foreground mb-8">
        Oops! It seems you&apos;ve wandered into an uncharted territory. The page you are looking for does not exist.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
