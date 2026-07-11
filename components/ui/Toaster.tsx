'use client';
import { useToastStore } from '@/lib/toast-store';
import { clsx } from 'clsx';

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const styles: Record<string, { bar: string; icon: string }> = {
  success: {
    bar: 'bg-[var(--primary-500)]',
    icon: 'bg-[var(--primary-500)]/15 text-[var(--primary-400)]',
  },
  error: {
    bar: 'bg-[var(--danger-500)]',
    icon: 'bg-[var(--danger-500)]/15 text-danger',
  },
  info: {
    bar: 'bg-[var(--violet-400)]',
    icon: 'bg-[var(--violet-400)]/15 text-[var(--violet-400)]',
  },
  warning: {
    bar: 'bg-[var(--gold-400)]',
    icon: 'bg-[var(--gold-400)]/15 text-[var(--gold-400)]',
  },
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="relative overflow-hidden rounded-2xl shadow-2xl pointer-events-auto
                     animate-slide-up flex items-start gap-3 p-4"
          style={{
            background: 'var(--surface-900)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          {/* left colour bar */}
          <span className={clsx('absolute left-0 top-0 bottom-0 w-1', styles[t.type].bar)} />

          {/* icon */}
          <div className={clsx(
            'ml-1.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
            styles[t.type].icon
          )}>
            {icons[t.type]}
          </div>

          {/* text */}
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {t.title}
            </p>
            {t.message && (
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                {t.message}
              </p>
            )}
          </div>

          {/* dismiss */}
          <button
            onClick={() => removeToast(t.id)}
            className="absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center
                       text-xs transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
