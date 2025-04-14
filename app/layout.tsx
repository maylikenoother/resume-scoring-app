import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './theme-registry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Review App',
  description: 'AI-powered CV review service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}