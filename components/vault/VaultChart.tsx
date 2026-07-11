'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface Harvest { yieldAmount: number; sharePrice: number; harvestedAt: string; }

function useCSSVar(name: string, fallback: string) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v) setValue(v);
  }, [name]);
  return value;
}

export function VaultChart({ harvests }: { harvests: Harvest[] }) {
  const tickColor    = useCSSVar('--text-tertiary', '#6b7280');
  const tooltipBg    = useCSSVar('--surface-900',   '#0d0b16');
  const tooltipBorder= useCSSVar('--border-subtle',  'rgba(30,25,55,0.8)');
  const tooltipLabel = useCSSVar('--text-tertiary',  '#6b7280');
  const emptyBorder  = useCSSVar('--border-muted',   'rgba(30,25,55,0.5)');
  const emptyColor   = useCSSVar('--text-muted',     '#4b5563');
  const accent       = useCSSVar('--primary-500',    '#1dd9b3');
  const accentLight  = useCSSVar('--primary-400',    '#3ae8c4');

  const data = harvests.map(h => ({
    date: format(new Date(h.harvestedAt), 'dd/MM HH:mm'),
    sharePrice: h.sharePrice / 1e9,
    yield: h.yieldAmount,
  })).reverse();

  return (
    <div className="card-gradient">
      <h2 className="text-lg font-semibold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Share Price History</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center rounded-xl"
          style={{ border: `2px dashed ${emptyBorder}`, color: emptyColor }}>
          No harvest data yet
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false}
                tick={{ fill: tickColor, fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: tickColor, fontSize: 11 }} domain={['auto', 'auto']} dx={-4} />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: tooltipLabel, fontSize: 12, marginBottom: 4 }}
                itemStyle={{ color: 'var(--primary-400)' }}
                formatter={(v: number) => [v.toFixed(6), 'Share Price']}
              />
              <Area
                type="monotone"
                dataKey="sharePrice"
                stroke={accent}
                strokeWidth={2}
                fill="url(#areaGrad)"
                activeDot={{ r: 4, fill: accentLight, stroke: tooltipBg, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
