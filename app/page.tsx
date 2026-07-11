'use client';
import Link from 'next/link';
import { useUIStore } from '@/lib/ui-store';
import { useNetworkStore } from '@/lib/network-store';
import { Icon, type IconName } from '@/components/ui/Icon';

const stats = [
  { label: 'Total Volume Routed', value: '$0', sub: 'Across all routes' },
  { label: 'TVL in Vaults',       value: '$0', sub: 'USDC deposited' },
  { label: 'Registered Pools',    value: '0',  sub: 'AMM + DEX' },
  { label: 'Yield Harvests',      value: '0',  sub: 'Auto-compounded' },
];

const features = [
  {
    icon: 'shuffle' as IconName,
    title: 'Smart Route Aggregation',
    desc: "Finds the optimal swap path across Stellar's order book and registered AMM pools. Supports up to 6-hop paths and split routing for minimal price impact on large orders.",
  },
  {
    icon: 'leaf' as IconName,
    title: 'Auto-compounding Yield Vaults',
    desc: 'Deposit a single token and earn yield from AMM LP fees and DEX maker rebates. The vault harvests and re-compounds every 6 hours. Withdraw any time with no lock-up.',
  },
  {
    icon: 'bar-chart' as IconName,
    title: 'On-chain Price Oracle',
    desc: 'TWAP oracle fed by authorized off-chain bots reading Stellar DEX data. Used to validate swap quotes and protect against price manipulation attacks.',
  },
  {
    icon: 'cash' as IconName,
    title: 'Fee Distribution',
    desc: 'Protocol fees collected by RouteAggregator and YieldVault are distributed on-chain to treasury, the yield vault, and LP reward pools.',
  },
];

export default function HomePage() {
  const { openDrawer, openWalletModal } = useUIStore();
  const { network } = useNetworkStore();
  const isMainnet = network === 'mainnet';

  return (
    <div className="space-y-28">
      {/* Hero */}
      <section className="relative pt-24 pb-16 text-center space-y-8 overflow-hidden">
        <div className="hero-glow" />
        <div className="relative space-y-6">
          <div className="badge-live mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
              style={{ background: 'var(--primary-400)' }} />
            {isMainnet ? 'Live on Stellar Mainnet' : 'Live on Stellar Testnet'}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
            Route smarter.<br />
            <span className="text-gradient">Earn exponentially.</span>
          </h1>

          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            YieldRoutes is a DEX aggregator and yield optimizer on Stellar.
            Get the best swap price across all AMM pools and order books.
            Deposit into auto-compounding vaults to earn on idle assets.
          </p>

          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <Link href="/swap" className="btn-primary ring-always text-base px-7 py-2.5">Swap Tokens</Link>
            <Link href="/vault" className="btn-outline ring-always text-base px-7 py-2.5">Yield Vault</Link>
            <span className="btn-accent ring-always text-base px-5 py-2.5 cursor-pointer" onClick={() => openDrawer('pools')}>
              View Pools →
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="stat-value">{s.value}</div>
              <div className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="stat-label">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works-heading">
        <div className="section-header">
          <h2 id="how-it-works-heading">How Route Aggregation <span className="text-gradient">Works</span></h2>
          <p>From your swap intent to an executed on-chain transaction</p>
        </div>

        <ol className="grid md:grid-cols-4 gap-6 md:gap-8 list-none" role="list">
          {[
            { step: '01', icon: 'wallet' as IconName, title: 'Specify Swap', desc: 'Pick input/output tokens and amount. Set your slippage tolerance.' },
            { step: '02', icon: 'search' as IconName, title: 'Routes Compared', desc: 'RouteAggregator queries all registered AMM pools and the Stellar DEX order book simultaneously.' },
            { step: '03', icon: 'flash' as IconName, title: 'Best Path Selected', desc: 'The path with highest output after fees and slippage is returned as a 60-second valid quote.' },
            { step: '04', icon: 'checkmark-circle' as IconName, title: 'Execute On-chain', desc: 'Sign with Freighter. Contract executes the route atomically. You receive tokens in the same transaction.' },
          ].map(s => (
            <li key={s.step} className="step-card" role="listitem">
              <div className="step-card-icon" aria-hidden="true">
                <Icon name={s.icon} size={120} />
              </div>
              <div className="step-number" aria-label={`Step ${s.step}`}>
                {s.step}
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-description">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="divider-gradient" />

      {/* Features */}
      <section>
        <div className="section-header">
          <h2>Everything you need to <span className="text-gradient">maximize yield</span></h2>
          <p>Built for Stellar, designed for performance</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map(f => (
              <div key={f.title} className="card-gradient flex items-start gap-5 relative overflow-hidden p-6">
                <div className="card-image-icon">
                  <Icon name={f.icon} size={80} />
                </div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-1.5 font-heading" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <div className="section-header">
          <h2>Explore the <span className="text-gradient">Protocol</span></h2>
          <p>Dive deeper into YieldRoutes tools and data</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: 'water' as IconName, title: 'Liquidity Pools', desc: 'View registered AMM pools and their status on Stellar.', action: () => openDrawer('pools') },
            { icon: 'bar-chart' as IconName, title: 'Price Oracle', desc: 'Check TWAP prices from authorized reporters.', action: () => openDrawer('oracle') },
            { icon: 'person' as IconName, title: 'My Position', desc: 'Look up your vault shares and deposit history.', action: () => openDrawer('profile') },
          ].map(item => (
            <div key={item.title} onClick={item.action}
              className="card-gradient cursor-pointer flex items-start gap-5 group relative overflow-hidden p-6">
              <div className="card-image-icon mt-1" style={{ width: 64, height: 64 }}>
                <Icon name={item.icon} size={64} />
              </div>
              <div className="flex flex-col h-full relative z-10">
                <h3 className="font-semibold text-lg font-heading" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                <span className="text-xs font-medium mt-auto pt-4" style={{ color: 'var(--primary-400)' }}>
                  Open panel →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card-glow text-center space-y-6 relative overflow-hidden">
        <div className="hero-glow opacity-50" />
        <div className="relative space-y-5 z-10 flex flex-col items-center">
          <div className="card-image-icon mb-2" style={{ width: 120, height: 120 }}>
            <Icon name="leaf" size={120} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight font-heading" style={{ color: 'var(--text-primary)' }}>Put your USDC to work</h2>
          <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            The YieldVault auto-compounds AMM LP fees and DEX rebates every 6 hours.
            No lock-up. Withdraw your principal + yield any time.
          </p>
          <Link href="/vault" className="btn-primary ring-always inline-flex px-8 py-3 text-base">
            Open Yield Vault
          </Link>
          <div>
            <span className="btn-accent ring-always text-sm px-5 py-2 inline-flex cursor-pointer" onClick={() => openWalletModal()}>
              Connect Wallet
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
