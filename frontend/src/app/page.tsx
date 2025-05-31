'use client';

// The actual page content is in HomeView from the presentation layer
import { HomeView } from '@/presentation/public/pages/page';
// import type { Metadata } from 'next'; // If specific metadata for home page

// export const metadata: Metadata = {
//   title: 'Homepage - My Portfolio',
// };

export default function HomePage() {
  return <HomeView />;
}
