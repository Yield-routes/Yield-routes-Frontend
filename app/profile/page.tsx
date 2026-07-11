'use client';
import { useUIStore } from '@/lib/ui-store';
import { ProfileContent } from '@/components/ui/ProfileContent';

const v = (c: string) => ({ color: `var(${c})` });

export default function ProfilePage() {
  const { openDrawer } = useUIStore();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading" style={v('--text-primary')}>My Position</h1>
          <p className="mt-1" style={v('--text-tertiary')}>Check your vault shares and deposit history</p>
        </div>
        <button className="btn-accent text-xs px-4 py-2 mt-1" onClick={() => openDrawer('profile')}>
          Open Panel
        </button>
      </div>
      <ProfileContent />
    </div>
  );
}
