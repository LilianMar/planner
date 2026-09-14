'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Check, Trash2, Sun } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type Priority } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

type View = 'dia' | 'semana' | 'mes'

const VIEWS: { id: View; label: string }[] = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
]

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 07:00 – 22:00
const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const WEEK_TINT = ['bg-violet/15', 'bg-mint/15', 'bg-rose/15', 'bg-sun/20', 'bg-coral/15', 'bg-sage/15', 'bg-lila/20']
const AREAS = ['Trabajo', 'Familia', 'Finanzas', 'Bienestar', 'Hogar']
const PRIORITY_DOT: Record<Priority, string> = {
  alta: 'bg-rose',
  media: 'bg-sun',
  baja: 'bg-mint',
}

export default function PlaneadorPage() {
  const hydrated = useHydrated()
  const tasks = useThemis((s) => s.tasks)
  const addTask = useThemis((s) => s.addTask)
  const toggleTask = useThemis((s) => s.toggleTask)
  const removeTask = useThemis((s) => s.removeTask)

  const [view, setView] = useState<View>('dia')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [area, setArea] = useState('Trabajo')
  const [priority, setPriority] = useState<Priority>('media')

  const nowHour = new Date().getHours()
  const done = tasks.filter((t) => t.done).length

  const byHour = useMemo(() => {
    const map: Record<number, typeof tasks> = {}
    for (const t of tasks) {
      const h = t.time ? Number(t.time.slice(0, 2)) : -1
      ;(map[h] ??= []).push(t)
    }
    return map
  }, [tasks])

  const submit = () => {
    if (!title.trim()) return
    addTask({ title: title.trim(), time, area, priority })
    setTitle('')
    setOpen(false)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Planeador personal"
        title="Tu agenda"
        subtitle="Un día a la vez, con calma."
        gradient="from-violet via-violet to-lila"
        right={
          <img
            src="/pngs/planeacion.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[46%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      {/* View toggle */}
      <div className="mx-6 mt-5 flex gap-1.5 rounded-2xl border border-border/60 bg-card p-1.5 shadow-lg shadow-violet/10">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              'flex-1 rounded-xl py-2 text-sm font-medium transition-colors',
              view === v.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <section className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
            {view === 'dia' ? 'Hoy' : view === 'semana' ? 'Esta semana' : 'Este mes'}
            <span className="rounded-full bg-violet/10 px-2.5 py-1 font-mono text-xs font-semibold text-violet">
              {hydrated ? done : 0}/{hydrated ? tasks.length : 0}
            </span>
          </h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Nueva actividad'}
          </button>
        </div>

        {open && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="¿Qué quieres planear?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
              />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              >
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {(['alta', 'media', 'baja'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors',
                    priority === p ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={submit}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {!hydrated ? null : tasks.length === 0 ? (
          <EmptyPlanner />
        ) : view === 'dia' ? (
          <div className="space-y-1">
            {HOURS.map((h) => {
              const items = byHour[h] ?? []
              const isNow = h === nowHour
              return (
                <div key={h} className="flex gap-3">
                  <span
                    className={cn(
                      'w-12 shrink-0 pt-2 text-right font-mono text-xs',
                      isNow ? 'font-bold text-violet' : 'text-muted-foreground',
                    )}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                  <div
                    className={cn(
                      'flex-1 space-y-1.5 border-l-2 pb-2 pl-3',
                      isNow ? 'border-violet' : 'border-border/60',
                    )}
                  >
                    {items.map((t) => (
                      <TaskCard key={t.id} t={t} onToggle={toggleTask} onRemove={removeTask} />
                    ))}
                  </div>
                </div>
              )
            })}
            {(byHour[-1]?.length ?? 0) > 0 && (
              <div className="pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sin hora
                </p>
                <div className="space-y-1.5">
                  {byHour[-1].map((t) => (
                    <TaskCard key={t.id} t={t} onToggle={toggleTask} onRemove={removeTask} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : view === 'semana' ? (
          <div className="grid grid-cols-2 gap-3">
            {WEEK.map((d, i) => (
              <div
                key={d}
                className={cn('rounded-2xl border border-border/60 p-3 shadow-sm', WEEK_TINT[i])}
              >
                <p className="mb-2 text-sm font-semibold">{d}</p>
                <div className="space-y-1.5">
                  {tasks.slice(i, i + 2).map((t) => (
                    <div key={t.id} className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[t.priority])} />
                      <span className="truncate text-xs text-foreground/80">{t.title}</span>
                    </div>
                  ))}
                  {tasks.slice(i, i + 2).length === 0 && (
                    <p className="text-xs text-muted-foreground/70">—</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MonthPlanner />
        )}
      </section>
    </div>
  )
}

function MonthPlanner() {
  const hydrated = useHydrated()
  const tasks = useThemis((s) => s.tasks)
  const goals = useThemis((s) => s.monthGoals)
  const addGoal = useThemis((s) => s.addMonthGoal)
  const toggleGoal = useThemis((s) => s.toggleMonthGoal)
  const removeGoal = useThemis((s) => s.removeMonthGoal)
  const meta = useThemis((s) => s.monthMeta)
  const setMeta = useThemis((s) => s.setMonthMeta)

  const [newGoal, setNewGoal] = useState('')
  const done = goals.filter((g) => g.done).length

  const metaFields: { key: 'project' | 'motivation' | 'challenge'; label: string; tint: string }[] = [
    { key: 'project', label: 'Mi proyecto', tint: 'focus:border-violet' },
    { key: 'motivation', label: 'Qué me motiva', tint: 'focus:border-mint' },
    { key: 'challenge', label: 'Mi desafío', tint: 'focus:border-coral' },
  ]

  const addNew = () => {
    if (!newGoal.trim()) return
    addGoal(newGoal.trim())
    setNewGoal('')
  }

  return (
    <div className="space-y-4">
      {/* Intención del mes */}
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:grid-cols-3">
        {metaFields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {f.label}
            </span>
            <input
              value={hydrated ? meta[f.key] : ''}
              onChange={(e) => setMeta(f.key, e.target.value)}
              placeholder="…"
              className={cn(
                'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none',
                f.tint,
              )}
            />
          </label>
        ))}
      </div>

      {/* Calendario */}
      <MonthView activeDays={tasks.map((_, i) => ((i * 4 + 3) % 28) + 1)} />

      {/* Actividades macro del mes */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold">Actividades del mes</h3>
          <span className="rounded-full bg-violet/10 px-2.5 py-1 font-mono text-xs font-semibold text-violet">
            {hydrated ? done : 0}/{hydrated ? goals.length : 0}
          </span>
        </div>

        <ul className="space-y-2">
          {hydrated &&
            goals.map((g) => (
              <li key={g.id} className="group flex items-center gap-2.5">
                <button
                  onClick={() => toggleGoal(g.id)}
                  aria-label={g.done ? 'Marcar pendiente' : 'Marcar hecha'}
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    g.done ? 'border-mint bg-mint text-white' : 'border-border',
                  )}
                >
                  {g.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
                <span className={cn('flex-1 text-sm', g.done && 'text-muted-foreground line-through')}>
                  {g.title}
                </span>
                <button
                  onClick={() => removeGoal(g.id)}
                  aria-label="Eliminar"
                  className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
        </ul>

        <div className="mt-3 flex gap-2">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNew()}
            placeholder="Nueva actividad macro…"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
          />
          <button
            onClick={addNew}
            aria-label="Añadir actividad"
            className="flex w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tus grandes tareas del mes, a la vista para irlas distribuyendo en los días.
        </p>
      </div>
    </div>
  )
}

function TaskCard({
  t,
  onToggle,
  onRemove,
}: {
  t: { id: string; title: string; done: boolean; priority: Priority; area: string }
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="group flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-2.5 shadow-sm">
      <button
        onClick={() => onToggle(t.id)}
        aria-label={t.done ? 'Marcar pendiente' : 'Marcar hecha'}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          t.done ? 'border-mint bg-mint text-white' : 'border-border',
        )}
      >
        {t.done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', t.done && 'text-muted-foreground line-through')}>
          {t.title}
        </p>
        <p className="text-xs text-muted-foreground">{t.area}</p>
      </div>
      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', PRIORITY_DOT[t.priority])} />
      <button
        onClick={() => onRemove(t.id)}
        aria-label="Eliminar"
        className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function MonthView({ activeDays }: { activeDays: number[] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const today = now.getDate()
  const active = new Set(activeDays)

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEK.map((d) => (
          <span key={d} className="text-[10px] font-medium text-muted-foreground">
            {d[0]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`x${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <div
            key={d}
            className={cn(
              'relative flex aspect-square items-center justify-center rounded-xl text-xs',
              d === today ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground/80',
            )}
          >
            {d}
            {active.has(d) && d !== today && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-violet" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyPlanner() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <span className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-sun/20 text-sun">
        <Sun className="h-8 w-8" />
      </span>
      <p className="font-heading text-lg font-semibold">¡Empieza a planear tu semana!</p>
      <p className="text-sm text-muted-foreground">Añade tu primera actividad y ordena tu día.</p>
    </div>
  )
}
