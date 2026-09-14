'use client'

import { Droplet, Minus, Plus } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { toLocalISO } from '@/lib/cycle'
import { cn } from '@/lib/utils'

export function WaterTracker() {
  const hydrated = useHydrated()
  const goal = useThemis((s) => s.waterGoal)
  const setGoal = useThemis((s) => s.setWaterGoal)
  const log = useThemis((s) => s.waterLog)
  const setWater = useThemis((s) => s.setWater)

  const today = toLocalISO(new Date())
  const glasses = hydrated ? log[today] ?? 0 : 0

  return (
    <section className="px-6 pt-6">
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Droplet className="h-5 w-5 text-mint" /> Agua de hoy
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Meta
            <button
              onClick={() => setGoal(goal - 1)}
              aria-label="Bajar meta"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-4 text-center font-mono font-semibold text-foreground">{goal}</span>
            <button
              onClick={() => setGoal(goal + 1)}
              aria-label="Subir meta"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Vasos */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: goal }, (_, i) => {
            const filled = i < glasses
            return (
              <button
                key={i}
                onClick={() => setWater(today, filled && i === glasses - 1 ? i : i + 1)}
                aria-label={`Vaso ${i + 1}`}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                  filled ? 'border-transparent bg-mint/20 text-mint' : 'border-border text-muted-foreground/40',
                )}
              >
                <Droplet className={cn('h-4 w-4', filled && 'fill-mint')} />
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-mono text-lg font-bold text-foreground">{glasses}</span> / {goal} vasos
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setWater(today, glasses - 1)}
              aria-label="Quitar vaso"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWater(today, glasses + 1)}
              aria-label="Añadir vaso"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        {hydrated && glasses >= goal && (
          <p className="mt-2 rounded-xl bg-mint/15 px-3 py-1.5 text-center text-xs font-medium text-mint">
            ¡Meta cumplida! Bien hidratada 💧
          </p>
        )}
      </div>
    </section>
  )
}
