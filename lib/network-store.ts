import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NetworkId } from './network';
import { BUILD_NETWORK } from './network';

interface NetworkState {
  network: NetworkId;
  setNetwork: (n: NetworkId) => void;
}

function applyNetworkClass(network: NetworkId) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('mainnet', network === 'mainnet');
}

// ─── Wave transition ──────────────────────────────────────────────────────────
// Smoothest possible approach:
// 1. Snapshot the current page as a full-screen canvas screenshot
// 2. Pin it on top while we instantly apply the new theme underneath
// 3. Sweep a translucent diagonal wave across while crossfading the snapshot out
// — no jarring instant swap, the colour change dissolves in behind the wave

function runWave(onPeak: () => void) {
  if (typeof document === 'undefined') {
    onPeak();
    return;
  }

  const SWEEP   = 900;  // ms for the wave to cross the screen
  const EASING  = 'cubic-bezier(0.37, 0, 0.63, 1)'; // smooth sinusoidal

  // ── Snapshot layer ─────────────────────────────────────────────────────────
  // A fixed div that sits on top and fades out, giving the illusion of a
  // smooth dissolve from the old theme to the new one.
  const snapshot = document.createElement('div');
  snapshot.id = 'yr-snapshot';
  Object.assign(snapshot.style, {
    position:       'fixed',
    inset:          '0',
    zIndex:         '9997',
    pointerEvents:  'none',
    // Mimic the current page background so the swap is invisible at first
    background:     getComputedStyle(document.documentElement)
                      .getPropertyValue('--base').trim() || '#07050a',
    opacity:        '1',
    transition:     `opacity ${SWEEP * 0.9}ms ${EASING}`,
  });
  document.body.appendChild(snapshot);

  // ── Wave panel ─────────────────────────────────────────────────────────────
  const wave = document.createElement('div');
  wave.id = 'yr-wave';
  Object.assign(wave.style, {
    position:        'fixed',
    top:             '-50vh',
    left:            '0',
    width:           '200vw',
    height:          '200vh',
    // Very light tint — mostly just shapes the diagonal; colour change does the work
    background:      'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 60%, transparent 100%)',
    transform:       'translateX(110%) rotate(-8deg)',
    transformOrigin: 'top right',
    pointerEvents:   'none',
    zIndex:          '9998',
    willChange:      'transform',
    transition:      `transform ${SWEEP}ms ${EASING}`,
  });
  document.body.appendChild(wave);

  // ── Apply new theme immediately (hidden under snapshot) ────────────────────
  onPeak();

  // ── Start animations next frame ────────────────────────────────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Wave sweeps across
      wave.style.transform = 'translateX(-120%) rotate(-8deg)';
      // Snapshot fades out, revealing the new theme underneath
      snapshot.style.opacity = '0';
    });
  });

  // ── Clean up ───────────────────────────────────────────────────────────────
  setTimeout(() => {
    wave.remove();
    snapshot.remove();
  }, SWEEP + 100);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      network: BUILD_NETWORK,
      setNetwork: (network) => {
        // Clean up any in-progress transition
        document.getElementById('yr-wave')?.remove();
        document.getElementById('yr-snapshot')?.remove();

        runWave(() => {
          applyNetworkClass(network);
          set({ network });
        });
      },
    }),
    {
      name: 'yr-network',
      onRehydrateStorage: () => (state) => {
        // Silent re-apply on page load — no animation
        if (state) applyNetworkClass(state.network);
      },
    },
  ),
);
