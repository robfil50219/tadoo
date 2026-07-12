import type { Metadata, Viewport } from 'next';
import { PwaManager } from '@/components/pwa';
import 'leaflet/dist/leaflet.css';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Tadoo - Family Task Manager',
  description: 'A simple family to-do app with real-time sync',
  manifest: '/manifest.json',
  applicationName: 'Tadoo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tadoo',
    startupImage: '/icons/icon-512.png',
  },
  icons: {
    icon: '/images/favicon-tadoo.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#007c89',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaManager />
      </body>
    </html>
  );
}
