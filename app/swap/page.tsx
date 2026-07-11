'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

const TOKENS = [
  { symbol: 'USDC', address: 'USDC_PLACEHOLDER', decimals: 7, balance: '1,245.32' },
  { symbol: 'XLM',  address: 'XLM_PLACEHOLDER',  decimals: 7, balance: '5,320.00' },
  { symbol: 'USDT', address: 'USDT_PLACEHOLDER',  decimals: 7, balance: '834.17' },
  { symbol: 'yXLM', address: 'YXLM_PLACEHOLDER',  decimals: 7, balance: '0.00' },
];

const RECENT_ROUTES = [
  { tokens: 'USDC → XLM', amount: '500.00', result: '2,145.32 XLM', time: '2 min ago' },
  { tokens: 'XLM → USDC', amount: '1,000.00', result: '233.41 USDC', time: '15 min ago' },
  { tokens: 'USDC → USDT', amount: '250.00', result: '249.88 USDT', time: '1 hr ago' },
];

export default function SwapPage() {
  const [tokenIn, setTokenIn]   = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote]       = useState<any>(null);

  const quoteMut = useMutation({
    mutationFn: () => api.getQuote(tokenIn.address, tokenOut.address, Number(amountIn), 3),
    onSuccess: setQuote,
  });

  const executeMut = useMutation({
    mutationFn: () => api.executeRoute(quote.id, 'PLACEHOLDER_WALLET', quote.expectedOut * (1 - slippage / 100)),
    onSuccess: () => { setQuote(null); setAmountIn(''); },
  });

  const swapTokens = () => { setTokenIn(tokenOut); setTokenOut(tokenIn); setQuote(null); };
  const impactColor = !quote ? '' : quote.priceImpactBps < 100 ? 'text-[var(--primary-400)]' : quote.priceImpactBps < 300 ? 'text-[var(--gold-400)]' : 'text-danger';

  const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-heading" style={{ color: 'var(--text-primary)' }}>Swap</h1>
        <p style={{ color: 'var(--text-tertiary)' }}>Best price across all Stellar pools and order books</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ─── Swap Card ─── */}
        <div className="lg:col-span-3 card-gradient space-y-4">
          {/* You pay */}
          <div className="panel-subtle space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>You pay</span>
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                Balance: {tokenIn.balance}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input className="flex-1 bg-transparent text-3xl font-bold outline-none"
                placeholder="0.00" type="number" min="0" step="any"
                style={{ color: 'var(--text-primary)' }}
                value={amountIn} onChange={e => { setAmountIn(e.target.value); setQuote(null); }} />
              <select className="select-styled"
                value={tokenIn.symbol} onChange={e => { setTokenIn(TOKENS.find(t => t.symbol === e.target.value)!); setQuote(null); }}>
                {TOKENS.map(t => <option key={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
          </div>

          {/* Swap direction */}
          <div className="flex justify-center -my-2 relative z-10">
            <button onClick={swapTokens}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'var(--tab-bg)', border: 'var(--tab-border)', color: 'var(--text-secondary)' }}>
              ⇅
            </button>
          </div>

          {/* You receive */}
          <div className="panel-subtle space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>You receive</span>
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                Balance: {tokenOut.balance}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-3xl font-bold tracking-tight" style={{ color: 'var(--primary-400)' }}>
                {quote ? quote.expectedOut.toLocaleString(undefined, { maximumFractionDigits: 6 }) : (
                  <span style={{ color: 'var(--text-dim)' }} className="font-normal">—</span>
                )}
              </div>
              <select className="select-styled"
                value={tokenOut.symbol} onChange={e => { setTokenOut(TOKENS.find(t => t.symbol === e.target.value)!); setQuote(null); }}>
                {TOKENS.map(t => <option key={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
          </div>

          {/* Market info bar */}
          <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-muted)' }}>
            <span>
              Rate: 1 {tokenIn.symbol} ≈{' '}
              {quote
                ? (quote.expectedOut / Number(amountIn)).toFixed(6)
                : '—'} {tokenOut.symbol}
            </span>
            <span className="text-[var(--primary-400)]">▼ 0.12% 24h</span>
          </div>

          {/* Quote details */}
          {quote && (
            <div className="panel-subtle space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Price impact</span>
                <span className={impactColor}>{(quote.priceImpactBps / 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Protocol fee</span>
                <span style={{ color: 'var(--text-secondary)' }}>{quote.protocolFee?.toLocaleString() ?? '—'} {tokenIn.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Route hops</span>
                <span style={{ color: 'var(--text-secondary)' }}>{quote.legs?.length ?? 1}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Minimum received</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {(quote.expectedOut * (1 - slippage / 100)).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenOut.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Slippage */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Slippage</span>
            <div className="flex gap-1">
              {[0.1, 0.5, 1.0].map(s => (
                <button key={s} onClick={() => setSlippage(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    slippage === s
                      ? 'bg-[var(--primary-600)]/30 border border-[var(--primary-500)]/30'
                      : 'border border-[var(--border-subtle)]',
                  )}
                  style={{ color: slippage === s ? 'var(--primary-400)' : 'var(--text-muted)' }}
                  onMouseEnter={e => { if (slippage !== s) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { if (slippage !== s) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                  {s}%
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gradient" />

          {/* Action */}
          {!quote ? (
            <button className="btn-primary w-full justify-center"
              onClick={() => quoteMut.mutate()}
              disabled={!amountIn || Number(amountIn) <= 0 || quoteMut.isPending}>
              {quoteMut.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding best route…</>
              ) : 'Get Quote'}
            </button>
          ) : (
            <button className="btn-primary w-full justify-center"
              onClick={() => executeMut.mutate()}
              disabled={executeMut.isPending}>
              {executeMut.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Swapping…</>
              ) : `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`}
            </button>
          )}

          {(quoteMut.isError || executeMut.isError) && (
            <p className="text-danger text-sm text-center animate-slide-up">Transaction failed. Try again.</p>
          )}
          {executeMut.isSuccess && (
            <p className="text-[var(--primary-400)] text-sm text-center animate-slide-up">Swap successful</p>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick info */}
          <div className="card-border space-y-4">
            <h3 className="text-sm font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>Route Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Best route</span>
                <span style={{ color: 'var(--primary-400)' }} className="font-medium">
                  {quote ? `${quote.legs?.length ?? 1} hop${(quote.legs?.length ?? 1) > 1 ? 's' : ''}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Pool type</span>
                <span style={{ color: 'var(--text-secondary)' }}>AMM + DEX</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Available DEX</span>
                <span style={{ color: 'var(--text-secondary)' }}>Stellar</span>
              </div>
              <div className="divider-gradient" />
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-tertiary)' }}>Quote valid for</span>
                <span style={{ color: 'var(--text-secondary)' }}>60 seconds</span>
              </div>
            </div>
          </div>

          {/* Pools involved */}
          <div className="card-border space-y-3">
            <h3 className="text-sm font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>Pools Involved</h3>
            {quote?.legs?.length ? (
              <div className="space-y-2">
                {quote.legs.map((leg: any, i: number) => (
                  <div key={i} className="text-xs flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'var(--badge-live-bg)', color: 'var(--primary-400)' }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {leg.pool?.slice(0, 8) || 'Pool'}…
                    </span>
                    <span className="ml-auto font-mono" style={{ color: 'var(--text-muted)' }}>
                      {leg.feeBps} bps
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Get a quote to see involved pools</p>
            )}
          </div>

          {/* Recent routes */}
          <div className="card-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-heading" style={{ color: 'var(--text-primary)' }}>Recent Swaps</h3>
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-dim)' }}>Network</span>
            </div>
            <div className="space-y-2">
              {RECENT_ROUTES.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg transition-colors"
                  style={{ background: i % 2 === 0 ? 'var(--input-bg)' : 'transparent' }}>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-secondary)' }}>{r.tokens}</div>
                    <div style={{ color: 'var(--text-dim)' }}>{r.amount} → {r.result}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
