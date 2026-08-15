/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
import '../app/globals.css';
import ThemeRegistry from './theme-registry';
import { AuthProvider } from './components/AuthProvider';

export const metadata = { title: 'CV Review | Clear, actionable feedback', description: 'Get structured, practical feedback on your CV.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeRegistry><AuthProvider>{children}</AuthProvider></ThemeRegistry></body></html>;
}
