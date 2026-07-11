import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalModals } from '@/components/ui/GlobalModals';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageTransition } from '@/components/ui/PageTransition';

export const metadata: Metadata = {
  title: 'YieldRoutes — DEX Routing & Yield Optimizer on Stellar',
  description: 'Find the best swap route across Stellar DEX and AMM pools. Deposit into auto-compounding yield vaults. All on-chain via Soroban.',
  keywords: ['Stellar', 'DeFi', 'DEX', 'yield', 'AMM', 'Soroban', 'swap'],
  openGraph: {
    title: 'YieldRoutes',
    description: 'Optimal DEX routing and yield optimization on Stellar',
    type: 'website',
    siteName: 'YieldRoutes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YieldRoutes',
    description: 'Optimal DEX routing and yield optimization on Stellar',
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
      <body className="antialiased font-sans">
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
