import {
  Activity,
  BookOpen,
  Droplet,
  Sparkles,
  Heart,
  Moon,
  Dumbbell,
  Apple,
  type LucideIcon,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Droplet,
  Sparkles,
  Heart,
  Moon,
  Dumbbell,
  Apple,
}

/** Tailwind text/bg helpers keyed by THEMIS accent name */
export const accentText: Record<string, string> = {
  violet: 'text-violet',
  mint: 'text-mint',
  rose: 'text-rose',
  sun: 'text-sun',
  coral: 'text-coral',
  sage: 'text-sage',
  lila: 'text-lila',
  navy: 'text-navy',
}

export const accentBg: Record<string, string> = {
  violet: 'bg-violet',
  mint: 'bg-mint',
  rose: 'bg-rose',
  sun: 'bg-sun',
  coral: 'bg-coral',
  sage: 'bg-sage',
  lila: 'bg-lila',
  navy: 'bg-navy',
}

export const accentSoftBg: Record<string, string> = {
  violet: 'bg-violet/15',
  mint: 'bg-mint/20',
  rose: 'bg-rose/20',
  sun: 'bg-sun/25',
  coral: 'bg-coral/20',
  sage: 'bg-sage/20',
  lila: 'bg-lila/25',
  navy: 'bg-navy/15',
}
