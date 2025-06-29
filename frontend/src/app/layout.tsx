import RootLayoutContent from '@/presentation/public/pages/layout';
import { ThemeProvider } from '@/presentation/shared/ui/theme-context';
import type { Metadata } from 'next';
import { config } from '@/domain/shared/utils/config';
import Head from 'next/head';

// Metadata should ideally stay in the src/app layout or page file.
// If RootLayoutContent also exports metadata, ensure it's handled correctly.
export const metadata: Metadata = {
  title: 'About Me - Portfolio', // Assuming this is the root metadata
  description: 'Personal portfolio',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side theme loading for SSR/ISR
  let themeData = null;
  let cssVariables = '';
  try {
    const response = await fetch(`${config.backendUrl}/api/public/themes`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      themeData = Array.isArray(data) ? data.find((t: any) => t.is_active) : data;
      if (themeData?.style_properties?.colors) {
        const vars = Object.entries(themeData.style_properties.colors)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
          .join('\n    ');
        cssVariables = `\n    :root {\n      ${vars}\n    }`;
      }
    }
  } catch (error) {
    console.error('Failed to load theme for SSR:', error);
  }

  return (
    <>
      {cssVariables && (
        <Head>
          <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        </Head>
      )}
      <ThemeProvider initialTheme={themeData}>
        <RootLayoutContent>{children}</RootLayoutContent>
      </ThemeProvider>
    </>
  );
}
