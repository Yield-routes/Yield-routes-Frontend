'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useNetworkStore } from '@/lib/network-store';

const nav = [
  {
    heading: 'Protocol',
    links: [
      { href: '/swap',    label: 'Swap' },
      { href: '/vault',   label: 'Yield Vault' },
      { href: '/pools',   label: 'Pools' },
      { href: '/oracle',  label: 'Oracle' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: 'https://github.com/yield-routes', label: 'GitHub', external: true },
      { href: '/docs',    label: 'Docs' },
      { href: '/profile', label: 'My Position' },
    ],
  },
];

export function Footer() {
  const { network } = useNetworkStore();
  const isMainnet = network === 'mainnet';

  return (
    <footer className="mt-24 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <Image src="/yieldroutes-icon.svg" alt="" width={28} height={28} className="rounded-lg shadow-lg shadow-primary-500/20" />
              <span className="font-bold font-display tracking-tight bg-gradient-to-r from-primary-300 to-primary-500
                               bg-clip-text text-transparent">
                YieldRoutes
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
              Optimal DEX routing and auto-compounding yield vaults on Stellar.
              All logic runs on-chain via Soroban smart contracts.
            </p>
            {/* Network status pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]
                            font-semibold uppercase tracking-wider"
              style={{
                background: 'var(--badge-live-bg)',
                border: 'var(--badge-live-border)',
                color: 'var(--primary-300)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--primary-400)' }} />
              {isMainnet ? 'Stellar Mainnet' : 'Stellar Testnet'}
            </div>
          </div>

          {/* Nav groups */}
          {nav.map(g => (
            <div key={g.heading} className="space-y-3">
              <p className="text-[11px] uppercase tracking-widest font-semibold"
                style={{ color: 'var(--text-muted)' }}>
                {g.heading}
              </p>
              <ul className="space-y-2">
                {g.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      {l.label}{l.external && <span className="ml-0.5 text-[10px]">↗</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-gradient mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} YieldRoutes. Open source under MIT licence.
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            v0.1.0-testnet
          </p>
        </div>
      </div>
    </footer>
  );
}
