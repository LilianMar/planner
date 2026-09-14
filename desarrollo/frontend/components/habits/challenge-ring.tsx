'use client'

import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { challengeProgress } from '@/lib/habits'

/** Reto de 30 días · ring de progreso SVG (M03). */
export function ChallengeRing() {
  const hydrated = useHydrated()
  const habits = useThemis((s) => s.habits)

  if (hydrated && habits.length === 0) return null

  const pct = hydrated ? challengeProgress(habits) : 0
  const r = 34
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="mx-6 mt-5 flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-4 shadow-lg shadow-violet/10">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--muted)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold">
          {pct}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-heading text-lg font-semibold leading-tight">Reto de 30 días</p>
        <p className="text-sm text-muted-foreground">Constancia en todos tus hábitos del mes</p>
        <p className="mt-1 text-xs text-violet">
          {pct >= 100 ? '¡Reto completado, increíble!' : 'Cada día cuenta. ¡Sigue sumando!'}
        </p>
      </div>
    </div>
  )
}
