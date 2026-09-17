import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';
import type { UrlRecord } from '../types/url';
import './AnalyticsSummary.css';

function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    const duration = 450;
    const start = performance.now();

    let frame: number;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display;
}

interface StatProps {
  icon: IconName;
  label: string;
  value: number;
}

function Stat({ icon, label, value }: StatProps) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="stat-card">
      <span className="stat-icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="stat-value">{animated.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

interface AnalyticsSummaryProps {
  urls: UrlRecord[];
}

export function AnalyticsSummary({ urls }: AnalyticsSummaryProps) {
  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);
  const activeCount = urls.filter((u) => u.status === 'active').length;

  return (
    <div className="analytics-summary">
      <Stat icon="analytics" label="Total clicks" value={totalClicks} />
      <Stat icon="link" label="Active links" value={activeCount} />
      <Stat icon="cursor-click" label="Total links" value={urls.length} />
    </div>
  );
}
