'use client'

import { Moon } from 'lucide-react'
import { useThemis, type SleepQuality } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { toLocalISO, addDays } from '@/lib/cycle'
import { accentBg, accentText } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

const QUALITIES: { key: SleepQuality; label: string; color: string }[] = [
  { key: 'excelente', label: 'Excelente', color: 'mint' },
  { key: 'bien', label: 'Bien', color: 'sage' },
  { key: 'regular', label: 'Regular', color: 'sun' },
  { key: 'mal', label: 'Mal', color: 'coral' },
]
const colorOf = (q: SleepQuality) => QUALITIES.find((x) => x.key === q)?.color ?? 'muted'

export function SleepTracker() {
  const hydrated = useHydrated()
  const sleepLog = useThemis((s) => s.sleepLog)
  const setSleep = useThemis((s) => s.setSleep)

  const today = toLocalISO(new Date())
  const entry = hydrated ? sleepLog[today] : undefined
  const hours = entry?.hours ?? 8

  const week = Array.from({ length: 7 }, (_, i) => toLocalISO(addDays(new Date(), -(6 - i))))

  return (
    <section className="px-6 pt-6">
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 font-heading text-lg font-semibold">
          <Moon className="h-5 w-5 text-violet" /> Sueño
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">¿Cómo dormiste anoche?</p>

        {/* Horas */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Horas</span>
            <span className="font-mono font-semibold text-violet">{hours} h</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => setSleep(today, { hours: Number(e.target.value), quality: entry?.quality ?? 'bien' })}
            aria-label="Horas de sueño"
            className="w-full accent-violet"
          />
        </div>

        {/* Calidad */}
        <div className="flex gap-2">
          {QUALITIES.map((q) => (
            <button
              key={q.key}
              onClick={() => setSleep(today, { hours: entry?.hours ?? 8, quality: q.key })}
              className={cn(
                'flex-1 rounded-xl border py-2 text-xs font-medium transition-colors',
                entry?.quality === q.key
                  ? cn('border-transparent text-white', accentBg[q.color])
                  : 'border-border text-muted-foreground',
              )}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Semana */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Últimos 7 días</p>
          <div className="flex items-end justify-between gap-1.5" style={{ height: 72 }}>
            {week.map((iso) => {
              const e = hydrated ? sleepLog[iso] : undefined
              const h = e ? Math.round((e.hours / 12) * 100) : 0
              return (
                <div key={iso} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div className="flex w-full items-end" style={{ height: 56 }}>
                    <div
                      className={cn('w-full rounded-md transition-all', e ? accentBg[colorOf(e.quality)] : 'bg-muted')}
                      style={{ height: `${Math.max(6, h)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{iso.slice(8)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {hydrated && entry && (
          <p className={cn('mt-3 text-center text-xs font-medium', accentText[colorOf(entry.quality)])}>
            {entry.hours} h · {QUALITIES.find((q) => q.key === entry.quality)?.label}
          </p>
        )}
      </div>
    </section>
  )
}
