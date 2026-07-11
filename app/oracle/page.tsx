'use client';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PriceSnapshot } from '@/lib/types';
import { Icon, type IconName } from '@/components/ui/Icon';

const v = (c: string) => ({ color: `var(${c})` });
const REFETCH_INTERVAL = 30_000;

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((y, i) => ({ i, y }));
  const color = positive ? 'var(--primary-400)' : 'var(--danger-400)';
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={chartData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${positive})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Refresh countdown ─────────────────────────────────────────────────────────
function RefreshCountdown({ interval, lastRefetch }: { interval: number; lastRefetch: number }) {
  const [remaining, setRemaining] = useState(interval / 1000);
  useEffect(() => {
    setRemaining(interval / 1000);
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [lastRefetch, interval]);
  const pct = (remaining / (interval / 1000)) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border-subtle)" strokeWidth="2" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--primary-400)" strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
      </div>
      <span className="text-xs tabular-nums" style={v('--text-muted')}>
        {remaining}s
      </span>
    </div>
  );
}

// ── Price card ────────────────────────────────────────────────────────────────
function PriceCard({ price, history }: { price: PriceSnapshot; history: PriceSnapshot[] }) {
  const [expanded, setExpanded] = useState(false);
  const sparkData = [...history].reverse().map(h => h.twapPrice / 1e9);
  const first = sparkData[0] ?? 0;
  const last  = sparkData[sparkData.length - 1] ?? 0;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const positive = change >= 0;
  const deviation = price.twapPrice > 0
    ? Math.abs((price.price - price.twapPrice) / price.twapPrice * 100)
    : 0;

  return (
    <div className="card-gradient overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-4 p-5">
        {/* Token pair + reporter */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold" style={v('--text-primary')}>
              {price.baseToken.slice(0, 8)}…
            </span>
            <span style={v('--text-dim')}>/</span>
            <span className="font-mono text-sm font-semibold" style={v('--text-primary')}>
              {price.quoteToken.slice(0, 8)}…
            </span>
            <span className="badge-apy text-[10px]">TWAP</span>
            {deviation > 1 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--gold-400)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Icon name="warning" size={10} /> {deviation.toFixed(1)}% dev
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px]" style={v('--text-muted')}>Reporter:</span>
            <code className="text-[11px] font-mono" style={v('--text-tertiary')}>
              {price.reporter.slice(0, 10)}…
            </code>
            <span className="text-[11px]" style={v('--text-muted')}>
              · {formatDistanceToNow(new Date(price.recordedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparkData.length > 1 && (
          <div className="w-24 flex-shrink-0">
            <Sparkline data={sparkData} positive={positive} />
          </div>
        )}

        {/* Price + change */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold font-mono tabular-nums" style={v('--primary-400')}>
            {(price.twapPrice / 1e9).toFixed(6)}
          </div>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-xs font-semibold tabular-nums"
              style={{ color: positive ? 'var(--primary-400)' : 'var(--danger-400)' }}>
              {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
            <span className="text-[11px]" style={v('--text-muted')}>24h</span>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 border-t px-5 py-3 gap-4"
        style={{ borderColor: 'var(--border-subtle)' }}>
        {[
          { label: 'Spot',      value: (price.price / 1e9).toFixed(6) },
          { label: 'TWAP',      value: (price.twapPrice / 1e9).toFixed(6) },
          { label: 'Updated',   value: format(new Date(price.recordedAt), 'HH:mm:ss') },
        ].map(s => (
          <div key={s.label}>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={v('--text-muted')}>{s.label}</p>
            <p className="text-xs font-mono font-semibold tabular-nums" style={v('--text-secondary')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium
                   transition-colors border-t"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
        {expanded ? '▲ Hide history' : '▼ Show price history'}
      </button>

      {/* Expanded history chart */}
      {expanded && history.length > 1 && (
        <div className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={[...history].reverse().map(h => ({
              t: format(new Date(h.recordedAt), 'HH:mm'),
              twap: h.twapPrice / 1e9,
              spot: h.price / 1e9,
            }))}>
              <defs>
                <linearGradient id="twapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-400)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary-400)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-900)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: 'var(--text-muted)' }}
                itemStyle={{ color: 'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="twap" stroke="var(--primary-400)" strokeWidth={1.5}
                fill="url(#twapGrad)" dot={false} name="TWAP" />
              <Area type="monotone" dataKey="spot" stroke="var(--violet-400)" strokeWidth={1}
                fill="none" dot={false} name="Spot" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Submit price form ─────────────────────────────────────────────────────────
function SubmitPriceForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ baseToken: '', quoteToken: '', price: '', reporter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.baseToken || !form.quoteToken || !form.price || !form.reporter) {
      setError('All fields required'); return;
    }
    setSubmitting(true);
    try {
      await api.submitPrice(form.baseToken, form.quoteToken, Number(form.price), form.reporter);
      setForm({ baseToken: '', quoteToken: '', price: '', reporter: '' });
      setOpen(false);
      onSuccess();
    } catch { setError('Submission failed. Check your inputs.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="card-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-sm font-semibold transition-colors"
        style={v('--text-primary')}>
        <span className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'var(--badge-live-bg)', color: 'var(--primary-400)' }}>＋</span>
          Submit Price (Reporter)
        </span>
        <span style={v('--text-muted')}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Base Token Address</label>
              <input className="input font-mono text-xs" placeholder="G…"
                value={form.baseToken} onChange={e => setForm(f => ({ ...f, baseToken: e.target.value }))} />
            </div>
            <div>
              <label className="label">Quote Token Address</label>
              <input className="input font-mono text-xs" placeholder="G…"
                value={form.quoteToken} onChange={e => setForm(f => ({ ...f, quoteToken: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (× 10⁹)</label>
              <input className="input" type="number" placeholder="1000000000"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="label">Reporter Address</label>
              <input className="input font-mono text-xs" placeholder="G…"
                value={form.reporter} onChange={e => setForm(f => ({ ...f, reporter: e.target.value }))} />
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary text-xs" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary text-xs" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : 'Submit Price'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Oracle page ──────────────────────────────────────────────────────────
export default function OraclePage() {
  const [search, setSearch] = useState('');
  const [lastRefetch, setLastRefetch] = useState(Date.now());

  const { data: prices, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: api.listLatestPrices,
    refetchInterval: REFETCH_INTERVAL,
  });

  // History queries — one per price pair (up to 5)
  const pricePairs = prices?.slice(0, 5) ?? [];
  const historyQueries = pricePairs.map((p: PriceSnapshot) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['price-history', p.baseToken, p.quoteToken],
      queryFn: () => api.getPriceHistory(p.baseToken, p.quoteToken, 24),
      enabled: !!prices?.length,
      refetchInterval: REFETCH_INTERVAL,
    })
  );

  useEffect(() => { setLastRefetch(dataUpdatedAt); }, [dataUpdatedAt]);

  const handleManualRefresh = useCallback(() => { refetch(); }, [refetch]);

  const filtered = (prices ?? []).filter((p: PriceSnapshot) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.baseToken.toLowerCase().includes(q) ||
           p.quoteToken.toLowerCase().includes(q) ||
           p.reporter.toLowerCase().includes(q);
  });

  const activeCount = (prices ?? []).length;
  const avgDeviation = (prices ?? []).reduce((acc: number, p: PriceSnapshot) => {
    return acc + (p.twapPrice > 0 ? Math.abs((p.price - p.twapPrice) / p.twapPrice * 100) : 0);
  }, 0) / Math.max(activeCount, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading" style={v('--text-primary')}>Price Oracle</h1>
          <p className="mt-1" style={v('--text-tertiary')}>
            TWAP prices from authorized reporters — updated every 5 minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && <RefreshCountdown interval={REFETCH_INTERVAL} lastRefetch={lastRefetch} />}
          <button onClick={handleManualRefresh} className="btn-secondary text-xs flex items-center gap-1.5">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tracked Pairs',     value: isLoading ? '—' : String(activeCount) },
          { label: 'Avg TWAP Deviation', value: isLoading ? '—' : `${avgDeviation.toFixed(3)}%` },
          { label: 'Update Frequency',  value: '5 min' },
          { label: 'Window',            value: '1 hour TWAP' },
        ].map(s => (
          <div key={s.label} className="card-border p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-wider" style={v('--text-muted')}>{s.label}</p>
            <p className="text-xl font-bold tabular-nums" style={v('--primary-400')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={v('--text-dim')}>⌕</span>
        <input
          className="input pl-8"
          placeholder="Filter by token address or reporter…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={v('--text-muted')}>✕</button>
        )}
      </div>

      {/* Price cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-gradient p-5 space-y-3">
              <div className="flex justify-between"><div className="shimmer-line h-5 w-40 rounded" /><div className="shimmer-line h-8 w-28 rounded" /></div>
              <div className="shimmer-line h-12 w-full rounded" />
              <div className="grid grid-cols-3 gap-4">{[1,2,3].map(j => <div key={j} className="shimmer-line h-8 rounded" />)}</div>
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
              <p className="font-semibold font-heading" style={v('--text-primary')}>Failed to load oracle data</p>
            </div>
            <button onClick={handleManualRefresh} className="btn-secondary text-sm">Try again</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-border flex flex-col items-center py-16 space-y-3 relative overflow-hidden">
          <div className="card-icon-bg">
            <Icon name="bar-chart" size={140} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--badge-apy-bg)', border: 'var(--badge-apy-border)' }}>
              <Icon name="bar-chart" size={32} className="icon-inline" />
            </div>
            <div>
              <p className="font-semibold font-heading" style={v('--text-primary')}>{search ? 'No pairs match your search' : 'No price data yet'}</p>
              <p className="text-sm" style={v('--text-tertiary')}>
                {search ? 'Try a different token address or reporter' : 'Authorized reporters haven\'t submitted any prices yet'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p: PriceSnapshot, i: number) => (
            <PriceCard key={p.id} price={p} history={historyQueries[i]?.data ?? []} />
          ))}
        </div>
      )}

      {/* Submit form */}
      <SubmitPriceForm onSuccess={handleManualRefresh} />

      {/* How it works */}
      <div className="card-border p-5 space-y-3 relative overflow-hidden">
        <div className="card-icon-bg" style={{ opacity: 0.05 }}>
          <Icon name="radio" size={140} />
        </div>
        <h3 className="font-semibold relative z-10 font-heading" style={v('--text-primary')}>How the Oracle works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: 'radio' as IconName, title: 'Data Source', desc: 'Authorized off-chain bots read Stellar DEX order book data every 5 minutes and submit to the Soroban contract.' },
            { icon: 'triangle' as IconName, title: 'TWAP Calculation', desc: 'A 1-hour time-weighted average price smooths out flash-loan spikes and short-term manipulation attempts.' },
            { icon: 'lock-closed' as IconName, title: 'Access Control', desc: 'Only whitelisted reporter addresses can submit prices. The admin can add or remove reporters via the contract.' },
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
