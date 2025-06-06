import RootLayoutContent from '@/presentation/public/pages/layout';
import { ThemeProvider } from '@/presentation/shared/ui/theme-context';
import type { Metadata } from 'next';

// Metadata should ideally stay in the src/app layout or page file.
// If RootLayoutContent also exports metadata, ensure it's handled correctly.
export const metadata: Metadata = {
  title: 'About Me - Portfolio', // Assuming this is the root metadata
  description: 'Personal portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </ThemeProvider>
  );
}
