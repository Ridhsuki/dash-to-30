import type {Metadata} from 'next';
import { Inter, Press_Start_2P } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dash to 30 | 2D Financial Literacy Arcade Game',
  description: 'An 8-bit retro side-scrolling endless-runner web game focusing on financial literacy.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable}`}>
      <body className="bg-slate-900 text-slate-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
