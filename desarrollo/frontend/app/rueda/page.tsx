'use client'

import { useMemo, useState } from 'react'
import { Save, GitCompareArrows, Check } from 'lucide-react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { accentBg, accentText } from '@/lib/icon-map'
import { cn } from '@/lib/utils'

export default function RuedaPage() {
  const hydrated = useHydrated()
  const areas = useThemis((s) => s.lifeAreas)
  const setAreaScore = useThemis((s) => s.setAreaScore)
  const history = useThemis((s) => s.wheelHistory)
  const saveWheel = useThemis((s) => s.saveWheel)
  const reflection = useThemis((s) => s.wheelReflection)
  const setReflection = useThemis((s) => s.setWheelReflection)

  const [compare, setCompare] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const avg =
    areas.length === 0
      ? 0
      : Math.round((areas.reduce((a, x) => a + x.score, 0) / areas.length) * 10) / 10

  const lowest = [...areas].sort((a, b) => a.score - b.score)[0]

  const currentMonth = new Date().toISOString().slice(0, 7)
  const prevSnapshot = useMemo(
    () => [...history].filter((h) => h.date !== currentMonth).at(-1),
    [history, currentMonth],
  )

  const chartData = useMemo(
    () =>
      areas.map((a) => ({
        label: a.label,
        score: a.score,
        prev: prevSnapshot?.scores[a.id] ?? 0,
      })),
    [areas, prevSnapshot],
  )

  const handleSave = () => {
    saveWheel()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Rueda de la vida"
        title="Tu equilibrio"
        subtitle="¿Cómo te sientes en cada área hoy?"
        gradient="from-lila via-violet to-rose"
        right={
          <img
            src="/wheel-mind.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[46%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      {/* Radar */}
      <div className="relative mx-6 mt-5 rounded-3xl border border-border/60 bg-card p-2 shadow-lg shadow-violet/10">
        <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-violet/10 px-2.5 py-1 text-xs font-semibold text-violet">
          Media <span className="font-mono">{hydrated ? avg : '–'}</span>
        </span>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            {compare && prevSnapshot && (
              <Radar
                dataKey="prev"
                stroke="var(--muted-foreground)"
                fill="var(--muted-foreground)"
                fillOpacity={0.15}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}
            <Radar
              dataKey="score"
              stroke="var(--violet)"
              fill="var(--violet)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Acciones: guardar + comparar */}
      <div className="mx-6 mt-4 flex gap-2">
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors"
        >
          {savedFlash ? (
            <>
              <Check className="h-4 w-4" /> ¡Guardado!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Guardar evaluación
            </>
          )}
        </button>
        <button
          onClick={() => setCompare((c) => !c)}
          disabled={!prevSnapshot}
          className={cn(
            'flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40',
            compare && prevSnapshot ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
          )}
        >
          <GitCompareArrows className="h-4 w-4" />
          Comparar
        </button>
      </div>
      {compare && prevSnapshot && (
        <p className="mx-6 mt-2 text-xs text-muted-foreground">
          Comparando con tu evaluación de {prevSnapshot.date}.
        </p>
      )}
      {!prevSnapshot && (
        <p className="mx-6 mt-2 text-xs text-muted-foreground">
          Guarda este mes para poder comparar con el siguiente.
        </p>
      )}

      {hydrated && lowest && (
        <div className="mx-6 mt-4 rounded-2xl border border-border/60 bg-sun/15 p-4">
          <p className="text-sm">
            <span className="font-semibold">Sugerencia: </span>
            Tu área de <span className="font-semibold">{lowest.label}</span> es la más baja (
            {lowest.score}/10). Dedícale un pequeño gesto esta semana.
          </p>
        </div>
      )}

      {/* Sliders */}
      <section className="px-6 py-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Ajusta tus áreas</h2>
        <div className="space-y-4">
          {hydrated &&
            areas.map((area) => (
              <div key={area.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn('h-3 w-3 rounded-full', accentBg[area.color])} />
                    {area.label}
                  </span>
                  <span className={cn('font-mono text-sm font-semibold', accentText[area.color])}>
                    {area.score}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={area.score}
                  onChange={(e) => setAreaScore(area.id, Number(e.target.value))}
                  aria-label={`Puntuación de ${area.label}`}
                  className="w-full accent-violet"
                />
              </div>
            ))}
        </div>
      </section>

      {/* Reflexión guiada */}
      <section className="px-6 pb-2">
        <div className="rounded-3xl border border-border/60 bg-violet/5 p-5 shadow-sm">
          <h2 className="mb-2 font-heading text-lg font-semibold">
            ¿En qué área quiero enfocarme este mes?
          </h2>
          <textarea
            value={hydrated ? reflection : ''}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Escribe tu intención para este mes…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-violet"
          />
        </div>
      </section>

      {/* Frase de cierre */}
      <p className="px-8 py-6 text-center font-heading text-base italic text-muted-foreground text-balance">
        “La clave está en el equilibrio, no en la perfección.”
      </p>
    </div>
  )
}
