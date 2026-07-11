'use client';
import { useUIStore } from '@/lib/ui-store';
import { PoolsContent } from './PoolsContent';
import { OracleContent } from './OracleContent';
import { ProfileContent } from './ProfileContent';

export function SlideOver() {
  const { drawer, closeDrawer } = useUIStore();

  if (!drawer) return null;

  return (
    <>
      <div className="overlay" onClick={closeDrawer} />
      <div className="drawer">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--drawer-bg)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {drawer === 'pools' && 'Liquidity Pools'}
            {drawer === 'oracle' && 'Price Oracle'}
            {drawer === 'profile' && 'My Position'}
          </h2>
          <button onClick={closeDrawer} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            ✕
          </button>
        </div>
        <div className="p-5">
          {drawer === 'pools' && <PoolsContent />}
          {drawer === 'oracle' && <OracleContent />}
          {drawer === 'profile' && <ProfileContent />}
        </div>
      </div>
    </>
  );
}
