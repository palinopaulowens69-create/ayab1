import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">
        <Script
          id="ayab-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try{const t=localStorage.getItem('ayab-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch{}",
          }}
        />
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
