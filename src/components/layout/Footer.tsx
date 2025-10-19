
import Link from 'next/link';
import { AniStreamLogo } from '@/components/icons';

export function AppFooter() {
  return (
    <footer className="border-t hidden md:block">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/">
              <AniStreamLogo />
            </Link>
            <p className="max-w-xs text-center md:text-left text-sm text-muted-foreground">
              Your ultimate destination for watching anime online.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h4 className="font-headline font-semibold">Explore</h4>
              <Link href="/category/ongoing" className="text-sm text-muted-foreground hover:text-primary">Ongoing</Link>
              <Link href="/category/completed" className="text-sm text-muted-foreground hover:text-primary">Completed</Link>
              <Link href="/search" className="text-sm text-muted-foreground hover:text-primary">Search</Link>
            </div>
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h4 className="font-headline font-semibold">Account</h4>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Login</Link>
                <Link href="/bookmarks" className="text-sm text-muted-foreground hover:text-primary">Bookmarks</Link>
                <Link href="/history" className="text-sm text-muted-foreground hover:text-primary">History</Link>
            </div>
             <div className="flex flex-col gap-2 text-center md:text-left">
              <h4 className="font-headline font-semibold">Info</h4>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} AniStream. All rights reserved. This site does not store any files on our server, we only link to the media which is hosted on 3rd party services.
          </p>
        </div>
      </div>
    </footer>
  );
}
