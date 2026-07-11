'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useNetworkStore } from '@/lib/network-store';
import { useQueryClient } from '@tanstack/react-query';
import type { NetworkId } from '@/lib/network';
import { NETWORKS } from '@/lib/network';
import { toast } from '@/lib/toast-store';

// Per-network pill styles
const PILL_STYLES: Record<NetworkId, { active: string; dot: string }> = {
  testnet: {
    active: 'bg-[var(--primary-500)]/15 text-[var(--primary-300)] border border-[var(--primary-500)]/30',
    dot: 'bg-[var(--primary-400)]',
  },
  mainnet: {
    active: 'bg-rose-500/10 text-rose-300 border border-rose-500/25',
    dot: 'bg-rose-400',
  },
};

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetworkStore();
  const [showModal, setShowModal] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState<NetworkId | null>(null);
  const qc = useQueryClient();

  const handleSwitch = (target: NetworkId) => {
    if (target === network) return;
    if (NETWORKS[target].isProduction) {
      setPendingNetwork(target);
      setShowModal(true);
    } else {
      applySwitch(target);
    }
  };

  const applySwitch = (target: NetworkId) => {
    setNetwork(target);
    qc.clear();
    setShowModal(false);
    setPendingNetwork(null);
    toast.success(
      `Switched to ${NETWORKS[target].label}`,
      NETWORKS[target].isProduction
        ? 'You are now on the live Stellar network. Transactions use real funds.'
        : 'You are on the Stellar test network. No real funds are at risk.',
    );
  };

  return (
    <>
      {/* Refined pill switcher */}
      <div
        className="flex items-center p-0.5 rounded-xl gap-0.5"
        style={{ background: 'var(--tab-bg)', border: '1px solid var(--border-subtle)' }}
      >
        {(['testnet', 'mainnet'] as NetworkId[]).map(n => {
          const isActive = network === n;
          const s = PILL_STYLES[n];
          return (
            <button
              key={n}
              onClick={() => handleSwitch(n)}
              className={clsx(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold',
                'uppercase tracking-wider transition-all duration-250 select-none',
                isActive ? s.active : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              )}
            >
              {/* Status dot */}
              <span className={clsx(
                'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300',
                isActive ? [s.dot, 'animate-pulse-soft'] : 'bg-[var(--text-dim)]',
              )} />
              {NETWORKS[n].label}
            </button>
          );
        })}
      </div>

      {/* Mainnet confirmation modal */}
      {showModal && pendingNetwork && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)' }}
            onClick={() => { setShowModal(false); setPendingNetwork(null); }}
          />

          {/* Modal card */}
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl"
            style={{
              background: 'var(--surface-900)',
              border: '1px solid rgba(244,63,94,0.2)',
              boxShadow:
                '0 0 0 1px rgba(244,63,94,0.08), 0 24px 56px -12px rgba(0,0,0,0.55)',
            }}
          >
            {/* Icon */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.15)',
                }}
              >
                {/* Custom shield/live icon — no emoji */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(251,113,133,0.9)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Switch to Mainnet?
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  You are switching to the{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>live Stellar network</span>.
                  All transactions use{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>real funds</span>{' '}
                  and are irreversible on-chain.
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div
              className="rounded-xl p-3 space-y-2 text-xs"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-muted)' }}
            >
              {[
                { label: 'Network',    value: 'Public Global Stellar' },
                { label: 'Real funds', value: 'Yes — irreversible' },
                { label: 'Testnet tokens', value: 'Have no value here' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                className="btn-secondary flex-1 justify-center text-xs"
                onClick={() => { setShowModal(false); setPendingNetwork(null); }}
              >
                Cancel
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                           rounded-xl font-semibold text-xs text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 60%, #f43f5e 100%)',
                  boxShadow: '0 2px 16px -4px rgba(225,29,72,0.35)',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.filter = 'brightness(1.1)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.filter = '')
                }
                onClick={() => applySwitch(pendingNetwork)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse-soft" />
                Switch to Mainnet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
