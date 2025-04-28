'use client';

import '../app/globals.css';
import { Inter } from 'next/font/google';
import ThemeRegistry from './theme-registry';
import { AuthProvider } from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });
const metadata = {
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
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}