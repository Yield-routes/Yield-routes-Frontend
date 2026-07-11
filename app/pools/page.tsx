'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';
import type { RegisteredPool } from '@/lib/types';
import { Icon, type IconName } from '@/components/ui/Icon';

const v = (c: string) => ({ color: `var(${c})` });

// ── Copy to clipboard ─────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
                 transition-all duration-200"
      style={{
        background: copied ? 'var(--badge-live-bg)' : 'var(--code-bg)',
        color: copied ? 'var(--primary-400)' : 'var(--text-muted)',
        border: `1px solid ${copied ? 'var(--primary-500)' : 'transparent'}`,
      }}>
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  );
}

// ── Pool health badge ─────────────────────────────────────────────────────────
function HealthBadge({ active, age }: { active: boolean; age: number }) {
  // age in days
  const stale = age > 30;
  if (!active) return <span className="badge-neutral text-[10px]">Inactive</span>;
  if (stale)   return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--gold-400)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <Icon name="warning" size={12} className="icon-inline" /> Stale
    </span>
  );
  return (
    <span className="badge-live text-[10px]">
      <span className="w-1 h-1 rounded-full" style={{ background: 'var(--primary-400)' }} />
      Active
    </span>
  );
}

// ── Pool row ─────────────────────────────────────────────────────────────────
function PoolRow({ pool }: { pool: RegisteredPool }) {
  const [expanded, setExpanded] = useState(false);
  const age = Math.floor((Date.now() - new Date(pool.createdAt).getTime()) / 86_400_000);

  return (
    <div className="card-gradient overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 p-4 text-left transition-colors"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
        onMouseLeave={e => (e.currentTarget.style.background = '')}>
        {/* Token pair icons */}
        <div className="flex -space-x-2 flex-shrink-0">
          {[pool.tokenA, pool.tokenB].map((t, i) => (
            <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                    ring-2 ring-[var(--surface-900)]"
              style={{ background: i === 0 ? 'var(--badge-live-bg)' : 'var(--badge-apy-bg)',
                       color: i === 0 ? 'var(--primary-400)' : 'var(--gold-400)' }}>
              {t.slice(1, 3).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Pair label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold" style={v('--text-primary')}>
              {pool.tokenA.slice(0, 6)}…
            </span>
            <span className="text-xs" style={v('--text-dim')}>/</span>
            <span className="font-mono text-sm font-semibold" style={v('--text-primary')}>
              {pool.tokenB.slice(0, 6)}…
            </span>
            <HealthBadge active={pool.active} age={age} />
          </div>
          <code className="text-[11px] font-mono mt-0.5 block truncate max-w-xs" style={v('--text-muted')}>
            {pool.poolAddress}
          </code>
        </div>

        {/* Right meta */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-xs" style={v('--text-muted')}>Registered</p>
          <p className="text-sm font-medium" style={v('--text-secondary')}>
            {format(new Date(pool.createdAt), 'dd MMM yyyy')}
          </p>
        </div>

        {/* Expand chevron */}
        <span className="flex-shrink-0 transition-transform duration-200 text-sm"
          style={{ color: 'var(--text-dim)', transform: expanded ? 'rotate(180deg)' : '' }}>▼</span>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-4 space-y-4"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Addresses */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={v('--text-muted')}>Addresses</p>
              {[
                { label: 'Pool Contract', value: pool.poolAddress },
                { label: 'Token A',       value: pool.tokenA },
                { label: 'Token B',       value: pool.tokenB },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={v('--text-muted')}>{r.label}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono flex-1 truncate" style={v('--text-tertiary')}>{r.value}</code>
                    <CopyButton text={r.value} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pool details */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={v('--text-muted')}>Details</p>
              {[
                { label: 'Status',        value: pool.active ? 'Active' : 'Inactive' },
                { label: 'Registered',    value: format(new Date(pool.createdAt), 'dd MMM yyyy HH:mm') },
                { label: 'Age',           value: `${age} day${age !== 1 ? 's' : ''}` },
                { label: 'Last seen',     value: formatDistanceToNow(new Date(pool.createdAt), { addSuffix: true }) },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm py-1.5 border-b"
                  style={{ borderColor: 'var(--border-muted)' }}>
                  <span style={v('--text-muted')}>{r.label}</span>
                  <span className="font-medium" style={v('--text-secondary')}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap pt-1">
            <a href={`https://stellar.expert/explorer/testnet/contract/${pool.poolAddress}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-xs flex items-center gap-1.5">
              ↗ View on Explorer
            </a>
            <CopyButton text={pool.poolAddress} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Register pool form ────────────────────────────────────────────────────────
function RegisterPoolForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tokenA: '', tokenB: '', poolAddress: '' });
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => api.registerPool(form.tokenA, form.tokenB, form.poolAddress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pools'] });
      setForm({ tokenA: '', tokenB: '', poolAddress: '' });
      setOpen(false);
      onSuccess();
    },
    onError: () => setError('Registration failed. Verify all addresses are valid Stellar contract IDs.'),
  });

  return (
    <div className="card-border">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-sm font-semibold"
        style={v('--text-primary')}>
        <span className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--badge-live-bg)', color: 'var(--primary-400)' }}>＋</span>
          Register New Pool
        </span>
        <span style={v('--text-muted')}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs" style={v('--text-tertiary')}>
            Register a Soroban AMM pool contract so the RouteAggregator can include it in swap path calculations.
            All three addresses must be valid 56-character Stellar contract IDs.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">Token A Address</label>
              <input className="input font-mono text-xs" placeholder="G… or C…"
                value={form.tokenA} onChange={e => setForm(f => ({ ...f, tokenA: e.target.value }))} />
            </div>
            <div>
              <label className="label">Token B Address</label>
              <input className="input font-mono text-xs" placeholder="G… or C…"
                value={form.tokenB} onChange={e => setForm(f => ({ ...f, tokenB: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Pool Contract Address</label>
            <input className="input font-mono text-xs" placeholder="C…"
              value={form.poolAddress} onChange={e => setForm(f => ({ ...f, poolAddress: e.target.value }))} />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          {mut.isSuccess && <p className="text-xs" style={v('--primary-400')}>Pool registered successfully.</p>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary text-xs" onClick={() => { setOpen(false); setError(''); }}>Cancel</button>
            <button className="btn-primary text-xs" onClick={() => mut.mutate()}
              disabled={mut.isPending || !form.tokenA || !form.tokenB || !form.poolAddress}>
              {mut.isPending
                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering…</>
                : 'Register Pool'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Pools page ───────────────────────────────────────────────────────────
export default function PoolsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: pools, isLoading, isError, refetch } = useQuery({
    queryKey: ['pools'],
    queryFn: api.listPools,
    refetchInterval: 30_000,
  });

  const filtered = (pools ?? []).filter((p: RegisteredPool) => {
    const matchSearch = !search ||
      p.tokenA.toLowerCase().includes(search.toLowerCase()) ||
      p.tokenB.toLowerCase().includes(search.toLowerCase()) ||
      p.poolAddress.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? p.active :
      !p.active;
    return matchSearch && matchFilter;
  });

  const activeCount   = (pools ?? []).filter((p: RegisteredPool) => p.active).length;
  const inactiveCount = (pools ?? []).length - activeCount;

  const handleSuccess = useCallback(() => {
    setSuccessMsg('Pool registered!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading" style={v('--text-primary')}>Liquidity Pools</h1>
          <p className="mt-1" style={v('--text-tertiary')}>
            Registered Soroban AMM pools available for route aggregation
          </p>
        </div>
        {successMsg && (
          <span className="badge-live text-xs">{successMsg}</span>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Pools',   value: isLoading ? '—' : String((pools ?? []).length) },
          { label: 'Active',        value: isLoading ? '—' : String(activeCount), accent: true },
          { label: 'Inactive',      value: isLoading ? '—' : String(inactiveCount) },
          { label: 'Protocol',      value: 'Soroban AMM' },
        ].map(s => (
          <div key={s.label} className="card-border p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-wider" style={v('--text-muted')}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.accent ? 'var(--primary-400)' : 'var(--text-primary)' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={v('--text-dim')}>⌕</span>
          <input className="input pl-8 w-full" placeholder="Search by token or pool address…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              style={v('--text-muted')}>✕</button>
          )}
        </div>
        <div className="tab-group w-auto">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? 'tab-active px-3 py-1.5 text-xs capitalize' : 'tab-inactive px-3 py-1.5 text-xs capitalize'}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pool list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-gradient p-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="shimmer-line w-8 h-8 rounded-full" />
                <div className="shimmer-line w-8 h-8 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="shimmer-line h-4 w-48 rounded" />
                <div className="shimmer-line h-3 w-64 rounded" />
              </div>
              <div className="shimmer-line h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="card-border flex flex-col items-center py-16 space-y-4 relative overflow-hidden">
          <div className="card-icon-bg !opacity-[0.12]" style={{ color: 'var(--danger-400)' }}>
            <Icon name="warning" size={140} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <Icon name="warning" size={28} style={{ color: 'var(--danger-400)' }} />
            </div>
            <div>
              <p className="font-semibold font-heading" style={v('--text-primary')}>Failed to load pools</p>
            </div>
            <button onClick={() => refetch()} className="btn-secondary text-sm">Try again</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-border flex flex-col items-center py-16 space-y-3 text-center relative overflow-hidden">
          <div className="card-icon-bg">
            <Icon name="water" size={140} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--badge-live-bg)', border: 'var(--badge-live-border)' }}>
              <Icon name="water" size={32} className="icon-inline" />
            </div>
            <div>
              <p className="font-semibold font-heading" style={v('--text-primary')}>
                {search || filter !== 'all' ? 'No pools match your filter' : 'No pools registered yet'}
              </p>
              <p className="text-sm max-w-xs mt-1" style={v('--text-tertiary')}>
                {search || filter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Pools are registered by admin governance via the RouteAggregator contract'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs" style={v('--text-muted')}>
            Showing {filtered.length} of {(pools ?? []).length} pool{(pools ?? []).length !== 1 ? 's' : ''}
          </p>
          {filtered.map((p: RegisteredPool) => <PoolRow key={p.id} pool={p} />)}
        </div>
      )}

      {/* Register form */}
      <RegisterPoolForm onSuccess={handleSuccess} />

      {/* How it works */}
      <div className="card-border p-5 space-y-3 relative overflow-hidden">
        <div className="card-icon-bg" style={{ opacity: 0.05 }}>
          <Icon name="clipboard" size={140} />
        </div>
        <h3 className="font-semibold relative z-10 font-heading" style={v('--text-primary')}>How Pools work</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: 'clipboard' as IconName, title: 'Registry',     desc: 'Admin governance registers Soroban AMM pool contracts on-chain. Each pool defines a token pair and its contract address.' },
            { icon: 'shuffle' as IconName, title: 'Routing',      desc: 'When a user requests a swap, the RouteAggregator queries all active pools and the Stellar DEX to find the best path.' },
            { icon: 'flash' as IconName, title: 'Execution',    desc: 'The best route is executed atomically in a single Soroban transaction. All hops settle in the same ledger close.' },
          ].map(s => (
            <div key={s.title} className="flex gap-3 relative z-10">
              <span className="flex-shrink-0 mt-0.5 icon-inline">
                <Icon name={s.icon} size={24} />
              </span>
              <div>
                <p className="font-medium mb-1 font-heading" style={v('--text-primary')}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={v('--text-tertiary')}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
