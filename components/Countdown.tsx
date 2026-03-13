'use client';

import { useEffect, useState } from 'react';

function getDaysLeft(): number {
  const deadline = new Date('2026-09-01T00:00:00Z');
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Countdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(getDaysLeft());
    const timer = setInterval(() => setDays(getDaysLeft()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (days === null) return <span>...</span>;
  return <span className="font-extrabold">{days} jours</span>;
}
