'use client';
import Image from 'next/image';
import type { CSSProperties } from 'react';

/** Map of icon name → path inside /public/icons/ */
const iconPaths: Record<string, string> = {
  water:             '/icons/icon-pools.png',
  'bar-chart':       '/icons/icon-oracle.png',
  person:            '/icons/icon-profile.png',
  shuffle:           '/icons/icon-swap.png',
  leaf:              '/icons/icon-leaf.png',
  cash:              '/icons/icon-cash.png',
  wallet:            '/icons/icon-wallet.png',
  search:            '/icons/icon-search.png',
  flash:             '/icons/icon-flash.png',
  'checkmark-circle': '/icons/icon-check.png',
  moon:              '/icons/icon-moon.png',
  sunny:             '/icons/icon-sun.png',
  warning:           '/icons/icon-flash.png', // reuse flash as generic alert
  clipboard:         '/icons/icon-cash.png',
  radio:             '/icons/icon-oracle.png',
  triangle:          '/icons/icon-flash.png',
  'lock-closed':     '/icons/icon-wallet.png',
};

export type IconName = keyof typeof iconPaths;

export function Icon({
  name,
  size = 24,
  className = '',
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const src = iconPaths[name];
  if (!src) return null;

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
        priority={size >= 100}
      />
    </span>
  );
}

/** Returns a CSS url() pointing at the icon image — use for background-image */
export function getIconBgUri(name: IconName): string {
  const src = iconPaths[name];
  return src ? `url("${src}")` : 'none';
}
