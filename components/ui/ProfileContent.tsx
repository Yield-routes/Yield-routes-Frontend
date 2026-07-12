'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import type { VaultDeposit } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

const v = (c: string) => ({ color: `var(${c})` });

function StatSkeleton() {
  return (
    <div className="stat-card !p-4 space-y-2">
      <div className="shimmer-line h-6 w-20 rounded" />
      <div className="shimmer-line h-3 w-14 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="card-image-icon mb-2" style={{ width: 80, height: 80 }}>
          <Icon name="person" size={80} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold font-heading" style={v('--text-primary')}>No position found</p>
          <p className="text-sm" style={v('--text-tertiary')}>
            This address has no vault deposits yet.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="card-image-icon mb-2" style={{ width: 80, height: 80 }}>
          <Icon name="warning" size={80} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold font-heading" style={v('--text-primary')}>Lookup failed</p>
          <p className="text-sm" style={v('--text-tertiary')}>Could not fetch position data.</p>
        </div>
        <button onClick={onRetry} className="btn-secondary text-sm">Try again</button>
      </div>
    </div>
  );
}

export function ProfileContent() {
  const [address, setAddress] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['depositor', search],
    queryFn: () => api.getDepositorInfo(search),
    enabled: search.length === 56,
  });

  const hasSearched = search.length === 56;
  const hasPosition = data && (data.shares > 0 || data.deposits?.length > 0);

  return (
    <div className="space-y-5">
      <p className="text-sm" style={v('--text-tertiary')}>
        Check your vault shares and deposit history.
      </p>

      <div className="space-y-3">
        <input
          className="input font-mono text-xs"
          placeholder="Paste your Stellar address (G…)"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <button
          className="btn-primary w-full justify-center"
          onClick={() => setSearch(address)}
          disabled={address.length !== 56 || isLoading}
        >
          {isLoading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Looking up…</>
            : 'Look Up Position'
          }
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
        </div>
      )}

      {isError && hasSearched && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && hasSearched && !hasPosition && <EmptyState />}

      {data && hasPosition && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Shares',   value: (data.shares / 1e9).toFixed(4) },
              { label: 'Price',    value: (data.sharePrice / 1e9 || 0).toFixed(4) + ' USDC' },
              { label: 'Value',    value: (data.estimatedValue ?? 0).toFixed(2) + ' USDC' },
              { label: 'Deposits', value: String(data.deposits?.length ?? 0) },
            ].map(s => (
              <div key={s.label} className="stat-card !p-4">
                <div className="stat-value text-lg">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {data.deposits?.length > 0 && (
            <div className="rounded-xl p-4"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}>
              <h3 className="font-semibold text-sm mb-3 font-heading" style={v('--text-primary')}>
                Deposit History
              </h3>
              <div className="space-y-2">
                {data.deposits.map((d: VaultDeposit, i: number) => (
                  <div key={d.id}
                    className="flex justify-between items-center text-xs py-2"
                    style={i < data.deposits.length - 1 ? { borderBottom: '1px solid var(--border-muted)' } : {}}>
                    <div>
                      <span className="font-semibold" style={v('--primary-400')}>
                        +{d.amount.toLocaleString()} USDC
                      </span>
                      {d.txHash && (
                        <code className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--code-bg)', color: 'var(--text-muted)' }}>
                          {d.txHash.slice(0, 8)}…
                        </code>
                      )}
                    </div>
                    <span style={v('--text-muted')}>
                      {format(new Date(d.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
