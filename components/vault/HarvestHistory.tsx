'use client';
import { format } from 'date-fns';

interface Harvest { id: string; yieldAmount: number; totalAssets: number; sharePrice: number; harvestedAt: string; txHash?: string; }

export function HarvestHistory({ harvests }: { harvests: Harvest[] }) {
  if (!harvests.length) return null;
  return (
    <div className="card-gradient">
      <h2 className="text-lg font-semibold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Harvest History</h2>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {['Date', 'Yield Harvested', 'Total Assets', 'Share Price', 'Tx'].map(h => (
                <th key={h} className="pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {harvests.map(h => (
              <tr key={h.id}>
                <td className="pr-4" style={{ color: 'var(--text-tertiary)' }}>{format(new Date(h.harvestedAt), 'dd MMM yyyy HH:mm')}</td>
                <td className="pr-4 font-semibold" style={{ color: 'var(--primary-500)' }}>+{h.yieldAmount.toLocaleString()} USDC</td>
                <td className="pr-4" style={{ color: 'var(--text-secondary)' }}>{h.totalAssets.toLocaleString()} USDC</td>
                <td className="pr-4">
                  <code className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{(h.sharePrice / 1e9).toFixed(8)}</code>
                </td>
                <td className="pr-4">
                  {h.txHash ? (
                    <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--code-bg)', color: 'var(--text-muted)' }}>{h.txHash.slice(0,10)}&hellip;</code>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
