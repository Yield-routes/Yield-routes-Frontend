'use client';
import { Component, ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-5 text-center px-4 relative overflow-hidden">
          <div className="card-icon-bg !opacity-[0.12]" style={{ color: 'var(--danger-400)' }}>
            <Icon name="warning" size={140} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <Icon name="warning" size={28} style={{ color: 'var(--danger-400)' }} />
            </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm max-w-md" style={{ color: 'var(--text-tertiary)' }}>
              {this.state.error.message}
            </p>
          </div>
          <button
            className="btn-secondary text-sm"
            onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
