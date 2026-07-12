'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useUIStore } from '@/lib/ui-store';
import { NetworkSwitcher } from '@/components/ui/NetworkSwitcher';
import { Icon, type IconName } from '@/components/ui/Icon';

const links = [
  { href: '/',       label: 'Home' },
  { href: '/swap',   label: 'Swap' },
  { href: '/vault',  label: 'Vault' },
];

const quickLinks = [
  { id: 'pools'   as const, label: 'Pools',       icon: 'water' as IconName },
  { id: 'oracle'  as const, label: 'Oracle',      icon: 'bar-chart' as IconName },
  { id: 'profile' as const, label: 'My Position', icon: 'person' as IconName },
];

export function Navbar() {
  const path = usePathname();
  const [theme, setTheme]     = useState<'dark' | 'light'>('dark');
  const [spinning, setSpinning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { drawer, openDrawer, closeDrawer, openWalletModal } = useUIStore();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [path]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleDrawer = useCallback((id: 'pools' | 'oracle' | 'profile') => {
    setMobileOpen(false);
    if (drawer === id) closeDrawer(); else openDrawer(id);
  }, [drawer, openDrawer, closeDrawer]);

  useEffect(() => {
    const stored = localStorage.getItem('yr-theme') || 'dark';
    const t = stored === 'light' ? 'light' : 'dark';
    setTheme(t);
    document.documentElement.classList.toggle('light', t === 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    document.documentElement.classList.toggle('light', next === 'light');
    setTheme(next);
    localStorage.setItem('yr-theme', next);
  }, [theme]);

  return (
    <>
      <nav className="sticky top-0 z-50">
        <div className="absolute inset-0 bg-[var(--base)]/85 backdrop-blur-lg"
          style={{ borderBottom: '1px solid var(--border-subtle)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r
                        from-transparent via-primary-500/20 to-transparent" />

        <div className="relative container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/yieldroutes-icon.svg" alt="" width={32} height={32} className="rounded-lg shadow-lg shadow-primary-500/20" />
            <span className="font-bold font-display text-lg tracking-tight bg-gradient-to-r
                             from-primary-300 to-primary-500 bg-clip-text text-transparent">
              YieldRoutes
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => {
              const isActive = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-white/[0.04]
                                     border border-white/[0.06]" />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              );
            })}
            {quickLinks.map(q => (
              <button key={q.id} onClick={() => toggleDrawer(q.id)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  drawer === q.id
                    ? 'text-[var(--text-primary)] bg-white/[0.06] border border-white/[0.08]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}>
                <Icon name={q.icon} size={16} className="icon-inline" /> {q.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NetworkSwitcher />
            </div>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              <span className={clsx('theme-icon', spinning && 'rotating')}>
                <Icon name={theme === 'dark' ? 'moon' : 'sunny'} size={20} />
              </span>
            </button>

            <button onClick={openWalletModal}
              className="btn-primary text-xs uppercase tracking-wider px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
              Connect
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden w-10 h-10 rounded-xl flex flex-col items-center justify-center
                         gap-1.5 transition-all duration-200"
              style={{ background: 'var(--input-bg)', border: 'var(--input-border)' }}
            >
              <span className={clsx(
                'block w-4.5 h-0.5 rounded-full transition-all duration-300 origin-center',
                mobileOpen ? 'rotate-45 translate-y-2' : ''
              )} style={{ background: 'var(--text-secondary)', width: '18px', height: '2px' }} />
              <span className={clsx(
                'block rounded-full transition-all duration-300',
                mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
              )} style={{ background: 'var(--text-secondary)', width: '18px', height: '2px' }} />
              <span className={clsx(
                'block rounded-full transition-all duration-300 origin-center',
                mobileOpen ? '-rotate-45 -translate-y-2' : ''
              )} style={{ background: 'var(--text-secondary)', width: '18px', height: '2px' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ top: '4rem', background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div className={clsx(
        'fixed left-0 right-0 z-40 md:hidden transition-all duration-300 ease-out',
        mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      )} style={{ top: '4rem', background: 'var(--surface-900)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container mx-auto px-4 py-4 space-y-1">
          {links.map(l => {
            const isActive = path === l.href;            return (
              <Link key={l.href} href={l.href}
                className={clsx(
                  'flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.05] border border-white/[0.06]'
                    : 'hover:bg-white/[0.03]'
                )}
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {l.label}
              </Link>
            );
          })}
          <div className="h-px my-2" style={{ background: 'var(--border-subtle)' }} />
          {quickLinks.map(q => (
            <button key={q.id} onClick={() => toggleDrawer(q.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                drawer === q.id ? 'bg-white/[0.05] border border-white/[0.06]' : 'hover:bg-white/[0.03]'
              )}
              style={{ color: drawer === q.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              <Icon name={q.icon} size={18} className="icon-inline" />
              {q.label}
              {drawer === q.id && <span className="ml-auto text-xs" style={{ color: 'var(--primary-400)' }}>open</span>}
            </button>
          ))}
          <div className="h-px my-2" style={{ background: 'var(--border-subtle)' }} />
          <div className="px-1 py-2">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Network</p>
            <NetworkSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
