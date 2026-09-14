'use client'

import { Sparkles } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'

/** "Hoy me propongo" · 3 prioridades del día editables inline (M01). */
export function TodayIntentions() {
  const hydrated = useHydrated()
  const intentions = useThemis((s) => s.intentions)
  const setIntention = useThemis((s) => s.setIntention)

  return (
    <section className="mt-7 px-6">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold">
        <Sparkles className="h-5 w-5 text-violet" />
        Hoy me propongo
      </h2>
      <div className="space-y-2.5 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet/10 font-mono text-sm font-semibold text-violet">
              {i + 1}
            </span>
            <input
              value={hydrated ? intentions[i] ?? '' : ''}
              onChange={(e) => setIntention(i, e.target.value)}
              placeholder={`Prioridad ${i + 1}…`}
              className="flex-1 border-b border-transparent bg-transparent py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-violet/40"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
