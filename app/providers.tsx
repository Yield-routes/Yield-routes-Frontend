'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,          // 30s before refetch
        gcTime: 2 * 60 * 1000,     // 2min garbage collection
        retry: 1,                  // 1 retry max — don't hammer slow API
        refetchOnWindowFocus: false, // stop eager refetch on tab switch
      },
    },
  }));
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
