// The actual page content is in HomeView from the presentation layer
import { HomeView } from '@/presentation/public/pages/page';
import { config } from '@/domain/shared/utils/config';
// import type { Metadata } from 'next'; // If specific metadata for home page

// export const metadata: Metadata = {
//   title: 'Homepage - My Portfolio',
// };

export async function generateMetadata() {
  return {
    title: 'About Me - Portfolio',
    description: 'Personal portfolio with dynamic themes',
  };
}

// ISR mit 60 Sekunden Revalidation
export const revalidate = 60;

export default async function HomePage() {
  // Server-side theme loading für ISR
  let themeData = null;
  let cssVariables = '';
  
  try {
    const response = await fetch(`${config.backendUrl}/api/public/themes`, {
      next: { revalidate: 60 }, // ISR: 60 Sekunden Cache
    });
    
    if (response.ok) {
      const data = await response.json();
      themeData = Array.isArray(data) ? data.find((t: any) => t.is_active) : data;
      
      // Generate CSS variables for immediate injection
      if (themeData?.style_properties?.colors) {
        const vars = Object.entries(themeData.style_properties.colors)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
          .join('\n    ');
        
        cssVariables = `
    :root {
      ${vars}
    }`;
      }
    }
  } catch (error) {
    console.error('Failed to load theme for ISR:', error);
  }

  return (
    <>
      {cssVariables && (
        <style
          dangerouslySetInnerHTML={{
            __html: cssVariables
          }}
        />
      )}
      <HomeView initialTheme={themeData} />
    </>
  );
}
