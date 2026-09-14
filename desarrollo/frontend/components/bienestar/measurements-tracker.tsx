'use client'

import { useState } from 'react'
import { Ruler, Scale, TrendingDown, TrendingUp, Plus } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const PARTS = ['Cuello', 'Pecho', 'Brazo', 'Cintura', 'Cadera', 'Pierna', 'Pantorrilla']

export function MeasurementsTracker() {
  const hydrated = useHydrated()
  const weightLog = useThemis((s) => s.weightLog)
  const addWeight = useThemis((s) => s.addWeight)
  const measurements = useThemis((s) => s.measurements)
  const setMeasurement = useThemis((s) => s.setMeasurement)

  const [kg, setKg] = useState('')

  const sorted = hydrated ? [...weightLog].sort((a, b) => a.date.localeCompare(b.date)) : []
  const current = sorted.at(-1)?.kg
  const first = sorted[0]?.kg
  const change = current != null && first != null ? Math.round((current - first) * 10) / 10 : 0

  const submitWeight = () => {
    const v = Number.parseFloat(kg)
    if (!v || v <= 0) return
    addWeight(v)
    setKg('')
  }

  return (
    <section className="px-6 pt-6 pb-6">
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 font-heading text-lg font-semibold">
          <Scale className="h-5 w-5 text-sage" /> Medidas y peso
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Un registro para conocerte, no para exigirte.
        </p>

        {/* Peso */}
        <div className="rounded-2xl bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Peso actual</p>
              <p className="font-mono text-2xl font-bold">
                {hydrated && current != null ? `${current} kg` : '—'}
              </p>
            </div>
            {hydrated && current != null && first != null && change !== 0 && (
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                  change < 0 ? 'bg-mint/15 text-mint' : 'bg-sun/20 text-coral',
                )}
              >
                {change < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {change > 0 ? '+' : ''}
                {change} kg
              </span>
            )}
          </div>

          {hydrated && sorted.length > 1 && (
            <div className="mt-2 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sorted} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke="var(--sage)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--sage)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitWeight()}
              placeholder="Registrar peso (kg)"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
            />
            <button
              onClick={submitWeight}
              aria-label="Registrar peso"
              className="flex w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Medidas corporales */}
        <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Ruler className="h-3.5 w-3.5" /> Medidas (cm)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PARTS.map((part) => (
            <label
              key={part}
              className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background px-3 py-2"
            >
              <span className="text-sm">{part}</span>
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={hydrated ? measurements[part] ?? '' : ''}
                  onChange={(e) => setMeasurement(part, Number(e.target.value))}
                  className="w-12 bg-transparent text-right font-mono text-sm font-semibold outline-none"
                />
                <span className="text-xs text-muted-foreground">cm</span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-3 rounded-xl bg-sage/10 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
          Tu valor no se mide en cifras 🌿
        </p>
      </div>
    </section>
  )
}
