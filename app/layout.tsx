import type {Metadata} from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css'; // Global styles

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dash to 30 | 2D Financial Literacy Arcade Game',
  description: 'An 8-bit retro side-scrolling endless-runner web game focusing on financial literacy.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.className} bg-slate-950 text-slate-100 min-h-screen selection:bg-yellow-400 selection:text-slate-950`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
