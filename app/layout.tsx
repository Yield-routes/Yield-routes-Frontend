import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageTransition } from '@/components/ui/PageTransition';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yieldroutes.org'),
  title: 'YieldRoutes — DEX Routing & Yield Optimizer on Stellar',
  description: 'Find the best swap route across Stellar DEX and AMM pools. Deposit into auto-compounding yield vaults. All on-chain via Soroban.',
  keywords: ['Stellar', 'DeFi', 'DEX', 'yield', 'AMM', 'Soroban', 'swap'],
  icons: {
    icon: [
      { url: '/yieldroutes-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/yieldroutes-icon.png',
  },
  openGraph: {
    title: 'YieldRoutes',
    description: 'Optimal DEX routing and yield optimization on Stellar',
    type: 'website',
    siteName: 'YieldRoutes',
    images: [{ url: '/yieldroutes-lockup-dark.png', width: 1080, height: 270, alt: 'YieldRoutes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YieldRoutes',
    description: 'Optimal DEX routing and yield optimization on Stellar',
    images: ['/yieldroutes-lockup-dark.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('yr-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  if (theme === 'light') document.documentElement.classList.add('light');

                  // Apply mainnet class if user previously switched to mainnet
                  try {
                    var net = JSON.parse(localStorage.getItem('yr-network') || '{}');
                    if (net && net.state && net.state.network === 'mainnet') {
                      document.documentElement.classList.add('mainnet');
                    }
                  } catch(e) {}
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${spaceMono.variable} antialiased font-sans`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
          </main>
          <Footer />
          <GlobalModals />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
