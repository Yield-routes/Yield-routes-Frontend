'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import type { PriceSnapshot } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

const v = (c: string) => ({ color: `var(${c})` });

function PriceSkeleton() {
  return (
    <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
      <div className="flex items-center justify-between">
        <div className="shimmer-line h-4 w-32 rounded" />
        <div className="shimmer-line h-5 w-12 rounded-full" />
      </div>
      <div className="shimmer-line h-8 w-40 rounded" />
      <div className="flex justify-between">
        <div className="shimmer-line h-3 w-24 rounded" />
        <div className="shimmer-line h-3 w-12 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="card-image-icon mb-2" style={{ width: 80, height: 80 }}>
          <Icon name="bar-chart" size={80} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold font-heading" style={v('--text-primary')}>No price data yet</p>
          <p className="text-sm" style={v('--text-tertiary')}>
            Authorized reporters haven&apos;t submitted any prices yet.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="card-image-icon mb-2" style={{ width: 80, height: 80 }}>
          <Icon name="warning" size={80} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold font-heading" style={v('--text-primary')}>Failed to load prices</p>
          <p className="text-sm" style={v('--text-tertiary')}>Could not reach the oracle endpoint.</p>
        </div>
        <button onClick={onRetry} className="btn-secondary text-sm">Try again</button>
      </div>
    </div>
  );
}

export function OracleContent() {
  const { data: prices, isLoading, isError, refetch } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: api.listLatestPrices,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-5">
      <p className="text-sm" style={v('--text-tertiary')}>
        TWAP prices fed by authorized reporters from Stellar DEX data.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <PriceSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !prices?.length ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {prices.map((p: PriceSnapshot) => (
            <div key={p.id} className="p-4 rounded-xl space-y-3"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono" style={v('--text-tertiary')}>
                  {p.baseToken.slice(0, 6)}&hellip; / {p.quoteToken.slice(0, 6)}&hellip;
                </span>
                <span className="badge-apy">TWAP</span>
              </div>
              <div className="text-2xl font-bold tracking-tight" style={v('--primary-400')}>
                {(p.twapPrice / 1e9).toFixed(6)}
              </div>
              <div className="text-xs flex justify-between" style={v('--text-muted')}>
                <span>Spot: {(p.price / 1e9).toFixed(6)}</span>
                <span>{format(new Date(p.recordedAt), 'HH:mm')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl p-4 text-sm space-y-2"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
        <p className="font-semibold font-heading" style={v('--text-primary')}>How it works</p>
        <p style={v('--text-tertiary')}>
          Uses a <strong style={v('--text-secondary')}>TWAP</strong> from a rolling 1-hour window
          to resist flash-loan manipulation. Authorized reporters submit prices every 5 minutes.
        </p>
      </div>
    </div>
  );
}
