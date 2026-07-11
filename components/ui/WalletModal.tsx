'use client';
import { useUIStore } from '@/lib/ui-store';

const v = (c: string) => ({ color: `var(${c})` });

const wallets = [
  {
    id: 'freighter',
    name: 'Freighter',
    desc: 'Stellar blockchain wallet',
    icon: '⬡',
    color: 'var(--primary-400)',
    badge: 'Recommended',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    desc: 'Connect via QR code',
    icon: '⊞',
    color: 'var(--violet-400)',
    badge: null,
  },
  {
    id: 'ledger',
    name: 'Ledger',
    desc: 'Hardware wallet support',
    icon: '◆',
    color: 'var(--gold-400)',
    badge: null,
  },
  {
    id: 'stellarx',
    name: 'StellarX',
    desc: 'Web-based Stellar wallet',
    icon: '◈',
    color: 'var(--pink-400)',
    badge: null,
  },
];

const assets = [
  { symbol: 'USDC', name: 'USD Coin', balance: '—', network: 'Stellar' },
  { symbol: 'XLM', name: 'Stellar Lumens', balance: '—', network: 'Stellar' },
  { symbol: 'USDT', name: 'Tether USD', balance: '—', network: 'Stellar' },
];

export function WalletModal() {
  const { walletModal, closeWalletModal } = useUIStore();

  if (!walletModal) return null;

  return (
    <div className="wallet-modal">
      <div className="modal-bg" onClick={closeWalletModal} />
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={v('--text-primary')}>Connect Wallet</h2>
          <button onClick={closeWalletModal}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            ✕
          </button>
        </div>

        {/* Wallet list */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={v('--text-tertiary')}>Select wallet</p>
          {wallets.map(w => (
            <button key={w.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group"
              style={{ background: 'var(--input-bg)', border: 'var(--border-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--surface-800)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-muted)'; e.currentTarget.style.background = 'var(--input-bg)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                style={{ background: 'var(--badge-live-bg)', color: w.color }}>
                {w.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={v('--text-primary')}>{w.name}</span>
                  {w.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: 'var(--badge-live-bg)', color: 'var(--primary-300)' }}>
                      {w.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs" style={v('--text-muted')}>{w.desc}</span>
              </div>
              <span className="text-lg" style={v('--text-dim')}>→</span>
            </button>
          ))}
        </div>

        {/* Stellar assets */}
        <div>
          <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={v('--text-tertiary')}>Available on Stellar</p>
          <div className="space-y-1.5">
            {assets.map(a => (
              <div key={a.symbol} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: 'var(--input-bg)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--badge-live-bg)', color: 'var(--primary-400)' }}>
                  {a.symbol[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={v('--text-primary')}>{a.symbol}</div>
                  <div className="text-xs" style={v('--text-muted')}>{a.name} · {a.network}</div>
                </div>
                <span className="text-sm font-medium" style={v('--text-secondary')}>{a.balance}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center mt-5" style={v('--text-dim')}>
          By connecting, you agree to the Terms of Service
        </p>
      </div>
    </div>
  );
}
