'use client'

import { Check, Flame } from 'lucide-react'
import { useThemis, type Habit } from '@/lib/store'
import { iconMap, accentText, accentBg, accentSoftBg } from '@/lib/icon-map'
import { currentStreak } from '@/lib/habits'
import { cn } from '@/lib/utils'

interface HabitRowProps {
  habit: Habit
  weekDates: { iso: string; label: string; isToday: boolean }[]
}

export function HabitRow({ habit, weekDates }: HabitRowProps) {
  const toggleHabitDay = useThemis((s) => s.toggleHabitDay)
  const Icon = iconMap[habit.icon] ?? iconMap.Sparkles

  const doneThisWeek = weekDates.filter((d) => habit.log.includes(d.iso)).length
  const pct = Math.min(100, Math.round((doneThisWeek / habit.goal) * 100))
  const streak = currentStreak(habit.log)
  const onFire = streak >= 7

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            accentSoftBg[habit.color],
            accentText[habit.color],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{habit.name}</p>
          <p className="text-xs text-muted-foreground">
            {doneThisWeek}/{habit.goal} esta semana
          </p>
        </div>
        {streak > 0 && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              onFire ? 'bg-sun/25 text-coral' : 'bg-muted text-muted-foreground',
            )}
            title={`Racha de ${streak} días`}
          >
            <Flame className={cn('h-3.5 w-3.5', onFire && 'animate-pulse')} />
            {streak}
          </span>
        )}
        <span className={cn('font-mono text-sm font-semibold', accentText[habit.color])}>
          {pct}%
        </span>
      </div>
      {onFire && (
        <p className="mt-2 rounded-xl bg-sun/15 px-3 py-1.5 text-center text-xs font-medium text-coral">
          🔥 ¡{streak} días seguidos! Estás en racha.
        </p>
      )}

      {/* progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', accentBg[habit.color])}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* week toggles */}
      <div className="mt-3 flex justify-between">
        {weekDates.map((d) => {
          const checked = habit.log.includes(d.iso)
          return (
            <button
              key={d.iso}
              onClick={() => toggleHabitDay(habit.id, d.iso)}
              aria-label={`${habit.name} el ${d.label}`}
              aria-pressed={checked}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {d.label}
              </span>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
                  checked
                    ? cn(accentBg[habit.color], 'border-transparent text-card')
                    : 'border-border text-transparent',
                  d.isToday && !checked && 'border-foreground/40',
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
