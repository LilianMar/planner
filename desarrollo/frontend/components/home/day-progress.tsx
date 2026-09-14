'use client'

interface DayProgressProps {
  done: number
  total: number
}

export function DayProgress({ done, total }: DayProgressProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = 30
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="mt-5 mx-6 flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-4 shadow-lg shadow-violet/10">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="8"
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
        <p className="font-heading text-lg font-semibold leading-tight">Progreso del día</p>
        <p className="text-sm text-muted-foreground">
          {done} de {total} tareas completadas
        </p>
        <p className="mt-1 text-xs text-violet">
          {pct === 100 ? '¡Día redondo! Descansa, te lo ganaste.' : 'Vas por buen camino, sigue así.'}
        </p>
      </div>
    </div>
  )
}
