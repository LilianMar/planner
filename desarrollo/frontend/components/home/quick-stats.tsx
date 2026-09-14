'use client'

import { CheckCircle2, Flame, ListTodo, PiggyBank } from 'lucide-react'
import { useThemis, todayISO } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { currentStreak } from '@/lib/habits'

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/** Métricas rápidas del día (M01): hábitos, racha, tareas y finanzas. */
export function QuickStats() {
  const hydrated = useHydrated()
  const habits = useThemis((s) => s.habits)
  const tasks = useThemis((s) => s.tasks)
  const transactions = useThemis((s) => s.transactions)

  const today = todayISO()
  const habitsDone = habits.filter((h) => h.log.includes(today)).length
  const streak = habits.reduce((max, h) => Math.max(max, currentStreak(h.log)), 0)
  const tasksDone = tasks.filter((t) => t.done).length
  const balance = transactions.reduce((acc, t) => acc + (t.type === 'ingreso' ? t.amount : -t.amount), 0)

  const stats = [
    { icon: CheckCircle2, tint: 'bg-mint/20 text-mint', value: `${habitsDone}/${habits.length}`, label: 'Hábitos hoy' },
    { icon: Flame, tint: 'bg-sun/25 text-coral', value: `${streak}`, label: streak === 1 ? 'día de racha' : 'días de racha' },
    { icon: ListTodo, tint: 'bg-violet/15 text-violet', value: `${tasksDone}/${tasks.length}`, label: 'Tareas del día' },
    { icon: PiggyBank, tint: 'bg-coral/15 text-coral', value: eur(balance), label: 'Balance del mes' },
  ]

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 px-6">
      {stats.map(({ icon: Icon, tint, value, label }) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-base font-bold leading-tight">{hydrated ? value : '—'}</p>
            <p className="truncate text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
