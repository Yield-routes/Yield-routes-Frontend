'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { clsx } from 'clsx';
import { VaultChart } from '@/components/vault/VaultChart';
import { HarvestHistory } from '@/components/vault/HarvestHistory';
import { Icon } from '@/components/ui/Icon';

interface VaultHarvest {
  yieldAmount: number;
  harvestedAt: string;
}

function getEstimatedApr(totalAssets: number, harvests: VaultHarvest[] = []) {
  if (!totalAssets || !harvests.length) return null;

  const validHarvests = harvests
    .map(h => ({
      yieldAmount: Number(h.yieldAmount),
      harvestedAt: new Date(h.harvestedAt).getTime(),
    }))
    .filter(h => Number.isFinite(h.yieldAmount) && Number.isFinite(h.harvestedAt));

  if (!validHarvests.length) return null;

  const totalYieldHarvested = validHarvests.reduce((sum, h) => sum + h.yieldAmount, 0);
  const firstHarvestAt = Math.min(...validHarvests.map(h => h.harvestedAt));
  const daysSinceFirstHarvest = (Date.now() - firstHarvestAt) / 86_400_000;

  if (totalYieldHarvested <= 0 || daysSinceFirstHarvest <= 0) return null;

  return (totalYieldHarvested / totalAssets) * (365 / daysSinceFirstHarvest) * 100;
}

export default function VaultPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'deposit' | 'redeem'>('deposit');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vault-stats'],
    queryFn: api.getVaultStats,
    refetchInterval: 15_000,
  });

  const { data: harvests } = useQuery({
    queryKey: ['vault-harvests'],
    queryFn: api.listHarvests,
  });

  const { data: preview } = useQuery({
    queryKey: ['vault-preview', mode, amount],
    queryFn: () => mode === 'deposit'
      ? api.previewDeposit(Number(amount))
      : api.previewRedeem(Number(amount)),
    enabled: !!amount && Number(amount) > 0,
  });

  const depositMut = useMutation({
    mutationFn: () => api.deposit(wallet, Number(amount)),
    onSuccess: () => { setAmount(''); qc.invalidateQueries({ queryKey: ['vault-stats'] }); },
  });

  const redeemMut = useMutation({
    mutationFn: () => api.redeem(wallet, Number(amount)),
    onSuccess: () => { setAmount(''); qc.invalidateQueries({ queryKey: ['vault-stats'] }); },
  });

  const handleAction = () => mode === 'deposit' ? depositMut.mutate() : redeemMut.mutate();
  const isPending = depositMut.isPending || redeemMut.isPending;
  const isError   = depositMut.isError || redeemMut.isError;

  const v = (c: string) => ({ color: `var(${c})` });
  const estimatedApr = getEstimatedApr(stats?.totalAssets ?? 0, harvests ?? []);
  const aprValue = estimatedApr == null
    ? '—'
    : `${estimatedApr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading" style={v('--text-primary')}>Yield Vault</h1>
          <p className="mt-1" style={v('--text-tertiary')}>SEP-56 auto-compounding USDC vault — harvests every 6 hours</p>
        </div>
        <div className="badge-live mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-400)]" />
          SEP-56
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statsLoading ? (
          [1,2,3,4,5].map(i => <div key={i} className="card h-24"><div className="shimmer-line h-full w-full" /></div>)
        ) : (
          [
            { label: 'Total Assets',   value: `${(stats?.totalAssets ?? 0).toLocaleString()} USDC` },
            { label: 'Share Price',    value: `${(stats?.sharePrice ?? 1).toFixed(6)}` },
            { label: 'Total Harvests', value: String(stats?.harvestCount ?? 0) },
            { label: 'Yield Earned',   value: `${(stats?.totalYieldHarvested ?? 0).toLocaleString()} USDC` },
            {
              label: 'Est. APR',
              value: aprValue,
              valueClassName: 'text-yield-400',
              tooltip: 'Based on harvested yield since launch. Past performance does not indicate future returns.',
            },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={clsx('stat-value text-2xl', s.valueClassName)}>{s.value}</div>
              <div className="stat-label flex items-center justify-center gap-1">
                {s.label}
                {s.tooltip && (
                  <span className="group relative inline-flex">
                    <span
                      aria-label={s.tooltip}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-strong)] text-[10px] leading-none text-[var(--text-tertiary)]"
                      tabIndex={0}
                    >
                      i
                    </span>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-900)] px-3 py-2 text-center text-xs font-normal text-[var(--text-secondary)] opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      {s.tooltip}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 card-gradient space-y-5">
          <div className="tab-group">
            {(['deposit','redeem'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={clsx(mode === m ? 'tab-active' : 'tab-inactive')}>
                {m}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Wallet</label>
            <input className="input font-mono text-xs" placeholder="G..."
              value={wallet} onChange={e => setWallet(e.target.value)} />
          </div>

          <div>
            <label className="label">{mode === 'deposit' ? 'Deposit amount (USDC)' : 'Shares to redeem'}</label>
            <input className="input" type="number" min="0" step="any" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)} />
          </div>

          {preview && (
            <div className="panel-subtle text-sm flex justify-between items-center">
              <span style={v('--text-tertiary')}>
                {mode === 'deposit' ? 'You receive' : 'You get back'}
              </span>
              <span className="font-semibold" style={v('--primary-400')}>
                {mode === 'deposit'
                  ? `${preview.shares?.toLocaleString(undefined, { maximumFractionDigits: 6 })} shares`
                  : `${preview.assets?.toLocaleString(undefined, { maximumFractionDigits: 6 })} USDC`}
              </span>
            </div>
          )}

          <div className="divider-gradient" />

          <button className="btn-primary w-full justify-center" onClick={handleAction}
            disabled={isPending || !amount || !wallet || Number(amount) <= 0}>
            {isPending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
              : mode === 'deposit' ? 'Deposit to Vault' : 'Redeem Shares'}
          </button>

          {isError && <p className="text-danger text-sm text-center">Transaction failed.</p>}
          {(depositMut.isSuccess || redeemMut.isSuccess) && (
            <p className="text-[var(--primary-400)] text-sm text-center animate-slide-up">Transaction successful</p>
          )}
        </div>

        <div className="lg:col-span-2 card-gradient space-y-5">
          <h2 className="font-semibold text-lg font-heading" style={v('--text-primary')}>Vault Details</h2>
          <div className="space-y-0.5 text-sm">
            {[
              { label: 'Standard',          value: 'SEP-56' },
              { label: 'Strategy',          value: 'AMM pool liquidity' },
              { label: 'Harvest frequency', value: 'Every 6 hours' },
              { label: 'Performance fee',   value: '10%' },
              { label: 'Withdrawal fee',    value: 'None' },
              { label: 'Lock-up',           value: 'None' },
              { label: 'Underlying',        value: stats?.asset ? `${stats.asset.slice(0,10)}…` : 'USDC' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-2.5" style={{ borderBottom: 'var(--border-muted)' }}>
                <span style={v('--text-tertiary')}>{r.label}</span>
                <span className="font-medium text-right" style={v('--text-secondary')}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VaultChart harvests={harvests ?? []} />
      <HarvestHistory harvests={harvests ?? []} />

      {!harvests?.length && !statsLoading && (
        <div className="card-border flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--badge-apy-bg)', border: 'var(--badge-apy-border)' }}>
            <Icon name="leaf" size={32} className="icon-inline" style={{ color: 'var(--gold-400)' }} />
          </div>
          <div className="space-y-1">
            <p className="font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>No harvests yet</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              The vault harvests and auto-compounds every 6 hours. Check back soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

