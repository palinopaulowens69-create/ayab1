// Ito ang shared root layout ng app; dito inilalagay ang font setup, global styles, theme provider, at shared app state.
import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppProvider } from '@/lib/store';
import 'leaflet/dist/leaflet.css';
import './globals.css';

const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AYAB — Your Ride. Your way.',
  description:
    'AYAB is a tricycle booking platform for Tuguegarao City, Philippines, connecting commuters, drivers, and operators.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1769E0',
};

// Tumatanggap ng children at ibinabalik ang shared HTML layout kasama ang fonts at app state provider.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
