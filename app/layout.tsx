import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Tadoo - Family Task Manager',
  description: 'A simple family to-do app with real-time sync',
  icons: {
    icon: '/images/favicon-tadoo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
