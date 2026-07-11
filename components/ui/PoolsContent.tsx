'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import type { RegisteredPool } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

const v = (c: string) => ({ color: `var(${c})` });

function PoolSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl"
      style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <div className="shimmer-line h-4 w-16 rounded" />
          <div className="shimmer-line h-4 w-4 rounded" />
          <div className="shimmer-line h-4 w-16 rounded" />
          <div className="shimmer-line h-5 w-12 rounded-full ml-2" />
        </div>
        <div className="shimmer-line h-3 w-40 rounded" />
      </div>
      <div className="shimmer-line h-3 w-12 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="card-image-icon mb-2" style={{ width: 80, height: 80 }}>
          <Icon name="water" size={80} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold font-heading" style={v('--text-primary')}>No pools registered yet</p>
          <p className="text-sm" style={v('--text-tertiary')}>
            AMM pools are registered by admin governance via the RouteAggregator contract.
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
          <p className="font-semibold font-heading" style={v('--text-primary')}>Failed to load pools</p>
          <p className="text-sm" style={v('--text-tertiary')}>Could not reach the pools endpoint.</p>
        </div>
        <button onClick={onRetry} className="btn-secondary text-sm">Try again</button>
      </div>
    </div>
  );
}

export function PoolsContent() {
  const { data: pools, isLoading, isError, refetch } = useQuery({
    queryKey: ['pools'],
    queryFn: api.listPools,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-5">
      <p className="text-sm" style={v('--text-tertiary')}>
        Registered AMM pools available for route aggregation on Stellar.
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <PoolSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !pools?.length ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {pools.map((p: RegisteredPool) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={v('--text-secondary')}>
                    {p.tokenA.slice(0, 6)}…
                  </span>
                  <span style={v('--text-dim')}>/</span>
                  <span className="font-mono text-xs" style={v('--text-secondary')}>
                    {p.tokenB.slice(0, 6)}…
                  </span>
                  {p.active ? (
                    <span className="badge-live ml-1">
                      <span className="w-1 h-1 rounded-full" style={{ background: 'var(--primary-400)' }} />
                      Active
                    </span>
                  ) : (
                    <span className="badge-neutral ml-1">Inactive</span>
                  )}
                </div>
                <code className="text-xs font-mono mt-1 block" style={v('--text-muted')}>
                  {p.poolAddress.slice(0, 12)}…{p.poolAddress.slice(-6)}
                </code>
              </div>
              <span className="text-xs" style={v('--text-muted')}>
                {format(new Date(p.createdAt), 'dd MMM')}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl p-4 text-sm space-y-2"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
        <p className="font-semibold font-heading" style={v('--text-primary')}>About Pools</p>
        <p style={v('--text-tertiary')}>
          Each pool is a Soroban AMM contract registered on-chain. The RouteAggregator
          queries all active pools to find the best swap path.
        </p>
      </div>
    </div>
  );
}
