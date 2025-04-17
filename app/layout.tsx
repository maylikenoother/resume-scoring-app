import '../app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
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
        <ClerkProvider appearance={{
          variables: {
            colorPrimary: '#1976d2',
            colorDanger: '#d32f2f',
            colorSuccess: '#2e7d32',
            colorWarning: '#ed6c02',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '8px',
          },
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary-dark',
            card: 'rounded-xl shadow-md',
            avatarBox: 'rounded-full',
          }
        }}>
          <ThemeRegistry>{children}</ThemeRegistry>
        </ClerkProvider>
      </body>
    </html>
  );
}