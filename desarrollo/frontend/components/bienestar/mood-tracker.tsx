'use client'

import { Smile } from 'lucide-react'
import { useThemis, type MoodKey } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { toLocalISO } from '@/lib/cycle'
import { accentBg } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

const ORDER: MoodKey[] = ['feliz', 'tranquila', 'cansada', 'triste', 'ansiosa', 'enojada']
const MOODS: Record<MoodKey, { label: string; emoji: string; color: string }> = {
  feliz: { label: 'Feliz', emoji: '😊', color: 'sun' },
  tranquila: { label: 'Tranquila', emoji: '😌', color: 'mint' },
  cansada: { label: 'Cansada', emoji: '😴', color: 'lila' },
  triste: { label: 'Triste', emoji: '😢', color: 'violet' },
  ansiosa: { label: 'Ansiosa', emoji: '😰', color: 'coral' },
  enojada: { label: 'Enojada', emoji: '😠', color: 'rose' },
}
const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MoodTracker() {
  const hydrated = useHydrated()
  const moodLog = useThemis((s) => s.moodLog)
  const setMood = useThemis((s) => s.setMood)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = toLocalISO(now)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const monthLabel = now.toLocaleDateString('es-ES', { month: 'long' })

  const cycle = (iso: string) => {
    const current = moodLog[iso]
    const next = current ? ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] : ORDER[0]
    setMood(iso, next)
  }

  return (
    <section className="px-6 pt-6">
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 font-heading text-lg font-semibold">
          <Smile className="h-5 w-5 text-sun" /> Mood tracker
        </h2>
        <p className="mb-3 text-xs capitalize text-muted-foreground">{monthLabel} · toca un día para registrar tu ánimo</p>

        {/* Grid del mes */}
        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {WEEK.map((d) => (
            <span key={d} className="text-[10px] font-medium text-muted-foreground">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <span key={`x${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const iso = toLocalISO(new Date(year, month, d))
            const mood = hydrated ? moodLog[iso] : undefined
            const isToday = iso === today
            return (
              <button
                key={d}
                onClick={() => cycle(iso)}
                aria-label={`Ánimo del ${d}`}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-lg text-xs transition-colors',
                  mood ? cn(accentBg[MOODS[mood].color], 'text-white') : 'bg-muted text-muted-foreground/70',
                  isToday && 'ring-2 ring-violet ring-offset-1 ring-offset-card',
                )}
              >
                {mood ? MOODS[mood].emoji : d}
              </button>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
          {ORDER.map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-full', accentBg[MOODS[m].color])} />
              {MOODS[m].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
