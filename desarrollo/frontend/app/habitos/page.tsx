'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Flame } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { ChallengeRing } from '@/components/habits/challenge-ring'
import { HabitRow } from '@/components/habits/habit-row'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { iconMap, accentBg } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const COLORS = ['violet', 'mint', 'rose', 'sun', 'coral', 'sage', 'lila']
const ICONS = Object.keys(iconMap)

function getWeekDates() {
  const now = new Date()
  const day = (now.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() - day)
  const todayISO = now.toISOString().slice(0, 10)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return { iso, label: DAY_LABELS[i], isToday: iso === todayISO }
  })
}

export default function HabitosPage() {
  const hydrated = useHydrated()
  const habits = useThemis((s) => s.habits)
  const addHabit = useThemis((s) => s.addHabit)
  const weekDates = useMemo(getWeekDates, [])

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState('violet')
  const [goal, setGoal] = useState(5)

  const totalDone = habits.reduce(
    (acc, h) => acc + weekDates.filter((d) => h.log.includes(d.iso)).length,
    0,
  )
  const totalGoal = habits.reduce((acc, h) => acc + h.goal, 0)

  const submit = () => {
    if (!name.trim()) return
    addHabit({ name: name.trim(), icon, color, goal })
    setName('')
    setOpen(false)
  }

  return (
    <div className="lg:mx-auto lg:max-w-2xl">
      <GreetingHeader
        eyebrow="Tracker de hábitos"
        title="Tus hábitos"
        subtitle="Pequeños pasos, grandes cambios."
        gradient="from-mint via-mint to-sage"
        right={
          <img
            src="/habits-mind.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-32 max-w-[42%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-36"
          />
        }
      />

      <ChallengeRing />

      <div className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
            Esta semana
            <span className="flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-mint">
              <Flame className="h-3.5 w-3.5" />
              {hydrated ? totalDone : 0}/{hydrated ? totalGoal : 0}
            </span>
          </h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Nuevo hábito'}
          </button>
        </div>

        {open && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Nombre del hábito"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => {
                const Ic = iconMap[ic]
                return (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                      icon === ic ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                    )}
                  >
                    <Ic className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={cn(
                    'h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition-all',
                    accentBg[c],
                    color === c && 'ring-2 ring-foreground/40',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Meta semanal</label>
              <input
                type="range"
                min={1}
                max={7}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="flex-1 accent-violet"
              />
              <span className="w-8 font-mono text-sm font-semibold">{goal}x</span>
              <button
                onClick={submit}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Crear
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {hydrated &&
            habits.map((h) => <HabitRow key={h.id} habit={h} weekDates={weekDates} />)}
        </div>
      </div>
    </div>
  )
}
