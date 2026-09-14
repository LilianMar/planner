/** Lógica del ciclo menstrual (M-Ciclo).
 *  Funciones puras y sin acceso al DOM — listas para React Native. */

/* ---------- Fechas (en hora local, formato yyyy-mm-dd) ---------- */

export const toLocalISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const diffDays = (a: Date, b: Date) =>
  Math.round((parseISO(toLocalISO(a)).getTime() - parseISO(toLocalISO(b)).getTime()) / 86400000)

/* ---------- Fases ---------- */

export type PhaseKey = 'menstrual' | 'folicular' | 'ovulacion' | 'lutea'

export interface Phase {
  key: PhaseKey
  label: string
  color: string // nombre de acento THEMIS
  emoji: string
  tip: string
}

export const PHASES: Record<PhaseKey, Phase> = {
  menstrual: {
    key: 'menstrual',
    label: 'Menstrual',
    color: 'rose',
    emoji: '🌸',
    tip: 'Descansa y sé amable contigo. Tu cuerpo trabaja.',
  },
  folicular: {
    key: 'folicular',
    label: 'Folicular',
    color: 'mint',
    emoji: '🌱',
    tip: 'Sube tu energía. Buen momento para empezar cosas nuevas.',
  },
  ovulacion: {
    key: 'ovulacion',
    label: 'Ovulación',
    color: 'sun',
    emoji: '☀️',
    tip: 'Pico de energía y fertilidad. Brillas hacia afuera.',
  },
  lutea: {
    key: 'lutea',
    label: 'Lútea',
    color: 'lila',
    emoji: '🌙',
    tip: 'Baja el ritmo. Prioriza el autocuidado y la calma.',
  },
}

/** Día de ovulación estimado (1-indexado) según la duración media del ciclo. */
export const ovulationDay = (avgLength: number) => Math.max(10, avgLength - 14)

/** Fase del ciclo a partir del día (1-indexado). */
export function phaseForDay(cycleDay: number, avgLength: number, periodLength: number): Phase {
  const ov = ovulationDay(avgLength)
  if (cycleDay <= periodLength) return PHASES.menstrual
  if (cycleDay >= ov - 4 && cycleDay <= ov + 1) return PHASES.ovulacion
  if (cycleDay < ov - 4) return PHASES.folicular
  return PHASES.lutea
}

/* ---------- Estado actual y predicciones ---------- */

/** Inicio de regla más reciente en o antes de hoy. */
export function lastStart(starts: string[], today = new Date()): Date | null {
  const past = starts
    .map(parseISO)
    .filter((d) => diffDays(today, d) >= 0)
    .sort((a, b) => b.getTime() - a.getTime())
  return past[0] ?? null
}

export interface CycleStatus {
  cycleDay: number
  phase: Phase
  nextPeriod: Date
  daysUntilNext: number
  ovulation: Date
  fertileStart: Date
  fertileEnd: Date
}

export function cycleStatus(
  starts: string[],
  avgLength: number,
  periodLength: number,
  today = new Date(),
): CycleStatus | null {
  const last = lastStart(starts, today)
  if (!last) return null

  let anchor = last
  // Si ya pasó la duración media, proyecta al ciclo en curso.
  while (diffDays(today, anchor) >= avgLength) anchor = addDays(anchor, avgLength)

  const cycleDay = diffDays(today, anchor) + 1
  const ov = ovulationDay(avgLength)

  return {
    cycleDay,
    phase: phaseForDay(cycleDay, avgLength, periodLength),
    nextPeriod: addDays(anchor, avgLength),
    daysUntilNext: diffDays(addDays(anchor, avgLength), today),
    ovulation: addDays(anchor, ov - 1),
    fertileStart: addDays(anchor, ov - 6),
    fertileEnd: addDays(anchor, ov - 1),
  }
}

/* ---------- Marcadores de calendario ---------- */

export type DayKind = 'period' | 'fertile' | 'ovulation'

/** Mapa fecha→tipo para pintar un mes (regla, ventana fértil y ovulación). */
export function monthMarkers(
  year: number,
  month: number, // 0-indexado
  starts: string[],
  avgLength: number,
  periodLength: number,
): Map<string, DayKind> {
  const marks = new Map<string, DayKind>()
  if (starts.length === 0) return marks

  const rangeStart = new Date(year, month, 1)
  const rangeEnd = new Date(year, month + 1, 0)
  const ov = ovulationDay(avgLength)

  // Anclas: reglas registradas + proyección desde la última hacia delante/atrás.
  const anchors = new Set<number>()
  for (const s of starts) anchors.add(parseISO(s).getTime())
  const last = [...starts].map(parseISO).sort((a, b) => b.getTime() - a.getTime())[0]
  if (last) {
    for (let k = -2; k <= 14; k++) {
      const a = addDays(last, k * avgLength)
      if (diffDays(a, rangeStart) > 40 || diffDays(rangeEnd, a) > 40) continue
      anchors.add(a.getTime())
    }
  }

  const set = (d: Date, kind: DayKind, override = false) => {
    if (d < rangeStart || d > rangeEnd) return
    const key = toLocalISO(d)
    if (!override && marks.has(key)) return
    marks.set(key, kind)
  }

  for (const t of anchors) {
    const a = new Date(t)
    // Ventana fértil y ovulación primero (la regla tiene prioridad visual luego).
    for (let i = ov - 6; i <= ov - 1; i++) set(addDays(a, i), 'fertile')
    set(addDays(a, ov - 1), 'ovulation', true)
    // Días de regla (prioridad máxima).
    for (let i = 0; i < periodLength; i++) set(addDays(a, i), 'period', true)
  }

  return marks
}
