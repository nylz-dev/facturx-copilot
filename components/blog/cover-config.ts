import { ArrowRightLeft, BarChart3, BookOpen, Braces, CalendarDays, FileCheck2, Landmark, ListChecks, Network, Receipt, Scale, UserRound, type LucideIcon } from 'lucide-react';
import { normalize } from '@/lib/blog-utils';

// Generated covers (posts without an image): one colour family per category.
export const COVER_TONES = [
  { from: '#0c4a6e', to: '#0284c7', glow: '#38bdf8', glow2: '#818cf8' },
  { from: '#1e3a8a', to: '#2563eb', glow: '#60a5fa', glow2: '#22d3ee' },
  { from: '#312e81', to: '#4f46e5', glow: '#818cf8', glow2: '#38bdf8' },
  { from: '#134e4a', to: '#0d9488', glow: '#5eead4', glow2: '#38bdf8' },
];

// The icon follows the subject of the article first, then its category.
export function categoryIcon(category: string, title = ''): LucideIcon {
  const t = normalize(title);
  if (/sanction|amende/.test(t)) return Scale;
  if (/calendrier/.test(t)) return CalendarDays;
  if (/reporting/.test(t)) return BarChart3;
  if (/plateforme|pdp/.test(t)) return Network;
  if (/mention/.test(t)) return ListChecks;
  if (/auto-entrepreneur|micro/.test(t)) return UserRound;
  if (/convertir/.test(t)) return ArrowRightLeft;
  if (/ubl|cii|format/.test(t)) return Braces;
  const c = normalize(category);
  if (c.includes('factur')) return FileCheck2;
  if (c.includes('reglement')) return Landmark;
  if (c.includes('tutoriel') || c.includes('guide')) return BookOpen;
  return Receipt;
}
