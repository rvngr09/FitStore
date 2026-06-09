import type { Metadata } from 'next';
import { Anton, Archivo_Narrow, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display-lg',
});

const archivoNarrow = Archivo_Narrow({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-body-lg',
});

const jetbrainsMono = JetBrains_Mono({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-label-sm',
});

export const metadata: Metadata = {
  title: 'PERFORMANCE+X — Elite Training Gear',
  description: 'Precision-engineered equipment, high-performance apparel, and scientifically backed nutrition designed to push you beyond your perceived limits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${anton.variable} ${archivoNarrow.variable} ${jetbrainsMono.variable} bg-surface text-on-surface antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
