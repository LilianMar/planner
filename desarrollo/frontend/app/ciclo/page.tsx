'use client'

import { useMemo, useState } from 'react'
import { Droplets, CalendarHeart, Sparkle, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type Flow } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { accentSoftBg, accentText } from '@/lib/icon-map'
import { cn } from '@/lib/utils'
import { cycleStatus, monthMarkers, toLocalISO, type DayKind } from '@/lib/cycle'

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MOODS = ['😊', '😌', '😴', '😣', '😢', '😡']
const FLOWS: Flow[] = ['ligero', 'medio', 'abundante']
const SYMPTOMS = ['Cólicos', 'Dolor de cabeza', 'Cansancio', 'Hinchazón', 'Antojos', 'Sensibilidad', 'Acné', 'Insomnio']

const KIND_TINT: Record<DayKind, string> = {
  period: 'bg-rose text-white',
  fertile: 'bg-mint/30 text-foreground',
  ovulation: 'bg-sun text-white',
}

const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

export default function CicloPage() {
  const hydrated = useHydrated()
  const avg = useThemis((s) => s.cycleAvgLength)
  const periodLength = useThemis((s) => s.periodLength)
  const periodStarts = useThemis((s) => s.periodStarts)
  const cycleLogs = useThemis((s) => s.cycleLogs)
  const togglePeriodStart = useThemis((s) => s.togglePeriodStart)
  const setCycleSettings = useThemis((s) => s.setCycleSettings)
  const upsertCycleLog = useThemis((s) => s.upsertCycleLog)

  const today = toLocalISO(new Date())
  const status = useMemo(
    () => (hydrated ? cycleStatus(periodStarts, avg, periodLength) : null),
    [hydrated, periodStarts, avg, periodLength],
  )

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [settingsOpen, setSettingsOpen] = useState(false)

  const markers = useMemo(
    () => (hydrated ? monthMarkers(viewYear, viewMonth, periodStarts, avg, periodLength) : new Map()),
    [hydrated, viewYear, viewMonth, periodStarts, avg, periodLength],
  )

  const todayLog = cycleLogs.find((l) => l.date === today) ?? { date: today, symptoms: [] }
  const phase = status?.phase

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const setMood = (mood: string) =>
    upsertCycleLog({ ...todayLog, mood: todayLog.mood === mood ? undefined : mood })
  const setFlow = (flow: Flow) =>
    upsertCycleLog({ ...todayLog, flow: todayLog.flow === flow ? undefined : flow })
  const toggleSymptom = (sym: string) =>
    upsertCycleLog({
      ...todayLog,
      symptoms: todayLog.symptoms.includes(sym)
        ? todayLog.symptoms.filter((x) => x !== sym)
        : [...todayLog.symptoms, sym],
    })

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Ciclo menstrual"
        title="Tu ciclo"
        subtitle="Escúchate. Cada fase tiene su ritmo."
        gradient="from-rose via-lila to-violet"
        right={
          <img
            src="/pngs/menstruacion.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-28 max-w-[38%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-32"
          />
        }
      />

      {/* Fase actual */}
      {phase ? (
        <div
          className={cn(
            'mx-6 mt-5 flex items-center gap-4 rounded-3xl border border-border/60 p-4 shadow-lg shadow-violet/10',
            accentSoftBg[phase.color],
          )}
        >
          <span className="text-4xl">{phase.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn('font-heading text-lg font-bold', accentText[phase.color])}>
                Fase {phase.label}
              </p>
              {status && (
                <span className={cn('rounded-full bg-card px-2 py-0.5 font-mono text-xs font-semibold', accentText[phase.color])}>
                  Día {status.cycleDay}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80">{phase.tip}</p>
          </div>
        </div>
      ) : (
        <div className="mx-6 mt-5 rounded-3xl border border-border/60 bg-card p-5 text-center shadow-lg shadow-violet/10">
          <p className="text-sm text-muted-foreground">
            Registra el inicio de tu última regla para empezar a ver tu ciclo.
          </p>
        </div>
      )}

      {/* Predicciones */}
      {status && (
        <div className="mx-6 mt-4 grid grid-cols-3 gap-3">
          <PredictCard tint="bg-rose/15 text-rose" value={`${status.daysUntilNext}d`} label="Próxima regla" sub={fmt(status.nextPeriod)} />
          <PredictCard tint="bg-sun/20 text-coral" value={fmt(status.ovulation)} label="Ovulación" />
          <PredictCard tint="bg-mint/20 text-mint" value={fmt(status.fertileStart)} label="Inicio fértil" sub={`→ ${fmt(status.fertileEnd)}`} />
        </div>
      )}

      {/* Registrar regla */}
      <div className="mx-6 mt-4">
        <button
          onClick={() => togglePeriodStart(today)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors',
            periodStarts.includes(today)
              ? 'border border-rose bg-rose/10 text-rose'
              : 'bg-primary text-primary-foreground',
          )}
        >
          <Droplets className="h-4 w-4" />
          {periodStarts.includes(today) ? 'Hoy marcado como inicio de regla' : 'Registrar que hoy empezó mi regla'}
        </button>
      </div>

      {/* Calendario */}
      <section className="px-6 pt-6">
        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => shiftMonth(-1)} aria-label="Mes anterior" className="text-muted-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p className="font-heading text-base font-semibold capitalize">{monthLabel}</p>
            <button onClick={() => shiftMonth(1)} aria-label="Mes siguiente" className="text-muted-foreground">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

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
              const iso = toLocalISO(new Date(viewYear, viewMonth, d))
              const kind = markers.get(iso) as DayKind | undefined
              const isToday = iso === today
              return (
                <button
                  key={d}
                  onClick={() => togglePeriodStart(iso)}
                  aria-label={`Marcar regla el ${iso}`}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-xl text-xs transition-colors',
                    kind ? KIND_TINT[kind] : 'text-foreground/80 hover:bg-muted',
                    isToday && 'ring-2 ring-violet ring-offset-1 ring-offset-card font-bold',
                  )}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <Legend color="bg-rose" label="Regla" />
            <Legend color="bg-mint/40" label="Fértil" />
            <Legend color="bg-sun" label="Ovulación" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Toca un día para marcar/quitar el inicio de regla.</p>
        </div>
      </section>

      {/* Síntomas de hoy */}
      <section className="px-6 pt-6">
        <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold">
          <Sparkle className="h-5 w-5 text-lila" /> ¿Cómo te sientes hoy?
        </h2>
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
          {/* Ánimo */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ánimo</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all',
                    todayLog.mood === m ? 'bg-violet/15 ring-2 ring-violet' : 'bg-muted',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {/* Flujo */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Flujo</p>
            <div className="flex gap-2">
              {FLOWS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFlow(f)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors',
                    todayLog.flow === f ? 'border-rose bg-rose/10 text-rose' : 'border-border text-muted-foreground',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {/* Síntomas */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Síntomas</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    todayLog.symptoms.includes(sym)
                      ? 'border-lila bg-lila/15 text-lila'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ajustes del ciclo */}
      <section className="px-6 py-6">
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground"
        >
          <Settings2 className="h-4 w-4" /> Ajustes del ciclo
          <ChevronRight className={cn('ml-auto h-4 w-4 transition-transform', settingsOpen && 'rotate-90')} />
        </button>
        {settingsOpen && (
          <div className="mt-3 space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <SettingSlider
              label="Duración media del ciclo"
              value={avg}
              min={20}
              max={45}
              unit="días"
              onChange={(v) => setCycleSettings(v, periodLength)}
            />
            <SettingSlider
              label="Duración de la regla"
              value={periodLength}
              min={1}
              max={10}
              unit="días"
              onChange={(v) => setCycleSettings(avg, v)}
            />
          </div>
        )}
      </section>

      {/* Frase de cierre */}
      <p className="px-8 pb-6 text-center font-heading text-base italic text-muted-foreground text-balance">
        <CalendarHeart className="mx-auto mb-2 h-5 w-5 text-rose" />
        “Tu cuerpo no es un problema a resolver, es un ritmo a escuchar.”
      </p>
    </div>
  )
}

function PredictCard({ tint, value, label, sub }: { tint: string; value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 text-center shadow-sm">
      <span className={cn('mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl', tint)}>
        <CalendarHeart className="h-5 w-5" />
      </span>
      <p className="font-mono text-sm font-bold leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      {label}
    </span>
  )
}

function SettingSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn('font-mono text-sm font-semibold', accentText.violet)}>
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-violet"
      />
    </div>
  )
}
