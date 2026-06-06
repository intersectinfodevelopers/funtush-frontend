import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Providers } from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Funtush - Trek Booking & Management Platform',
    template: '%s | Funtush',
  },
  description: 'Discover, book, and manage amazing treks with Funtush - the ultimate trek booking platform.',
  keywords: ['trek', 'booking', 'adventure', 'hiking', 'travel'],
  authors: [{ name: 'Funtush Team' }],
  creator: 'Funtush',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
