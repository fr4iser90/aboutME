'use client';

import { LoginView } from '@/presentation/public/pages/login/page'; // Use named import
// import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Login',
// };

export default function LoginPage() {
  return <LoginView />; // Render LoginView
}
