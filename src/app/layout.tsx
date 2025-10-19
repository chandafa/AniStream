import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/Header';
import { AppFooter } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { sharedMetadata } from '@/lib/metadata';
import { FirebaseClientProvider } from '@/firebase';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

export const metadata: Metadata = {
  ...sharedMetadata,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <AppFooter />
            <BottomNavBar />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
