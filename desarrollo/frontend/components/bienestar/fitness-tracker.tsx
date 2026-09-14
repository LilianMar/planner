'use client'

import { useMemo, useState } from 'react'
import { Dumbbell, Plus, X, Trash2, Minus } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { toLocalISO, addDays } from '@/lib/cycle'
import { cn } from '@/lib/utils'

const TYPES = ['Caminata', 'Yoga', 'Gym', 'Correr', 'Baile', 'Pilates', 'Otro']

export function FitnessTracker() {
  const hydrated = useHydrated()
  const goal = useThemis((s) => s.fitnessGoal)
  const setGoal = useThemis((s) => s.setFitnessGoal)
  const workouts = useThemis((s) => s.workouts)
  const addWorkout = useThemis((s) => s.addWorkout)
  const removeWorkout = useThemis((s) => s.removeWorkout)

  const [open, setOpen] = useState(false)
  const [type, setType] = useState('Caminata')
  const [minutes, setMinutes] = useState('30')

  const { weekWorkouts, count, totalMin } = useMemo(() => {
    const now = new Date()
    const dow = (now.getDay() + 6) % 7
    const monday = addDays(now, -dow)
    const weekDates = new Set(Array.from({ length: 7 }, (_, i) => toLocalISO(addDays(monday, i))))
    const weekWorkouts = workouts.filter((w) => weekDates.has(w.date))
    const totalMin = weekWorkouts.reduce((a, w) => a + w.minutes, 0)
    return { weekWorkouts, count: weekWorkouts.length, totalMin }
  }, [workouts])

  const pct = hydrated ? Math.min(100, Math.round((count / goal) * 100)) : 0
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  const submit = () => {
    const m = Number.parseInt(minutes, 10)
    if (!m || m <= 0) return
    addWorkout({ date: toLocalISO(new Date()), type, minutes: m })
    setMinutes('30')
    setOpen(false)
  }

  return (
    <section className="px-6 pt-6">
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Dumbbell className="h-5 w-5 text-coral" /> Fitness
          </h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Registrar'}
          </button>
        </div>

        {/* Progreso semanal */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="var(--coral)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
              {hydrated ? count : 0}/{goal}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Esta semana</p>
            <p className="text-xs text-muted-foreground">
              {hydrated ? count : 0} de {goal} sesiones · {hydrated ? totalMin : 0} min
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              Meta semanal
              <button onClick={() => setGoal(goal - 1)} aria-label="Bajar meta" className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center font-mono font-semibold text-foreground">{goal}</span>
              <button onClick={() => setGoal(goal + 1)} aria-label="Subir meta" className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-background/60 p-3">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    type === t ? 'border-coral bg-coral/10 text-coral' : 'border-border text-muted-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Minutos"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
              />
              <button
                onClick={submit}
                className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Sesiones de la semana */}
        {hydrated && weekWorkouts.length > 0 && (
          <ul className="mt-4 space-y-2">
            {weekWorkouts.map((w) => (
              <li key={w.id} className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
                  <Dumbbell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{w.type}</p>
                  <p className="text-xs text-muted-foreground">{w.minutes} min · {w.date.slice(5)}</p>
                </div>
                <button
                  onClick={() => removeWorkout(w.id)}
                  aria-label="Eliminar"
                  className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 rounded-xl bg-sage/10 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
          Recuerda: tu valor no se mide en cifras. Muévete para sentirte bien. 🌿
        </p>
      </div>
    </section>
  )
}
