/** Helpers de hábitos compartidos entre Inicio (M01) y Tracker (M03). */

const dayISO = (d: Date) => d.toISOString().slice(0, 10)

/** Racha de días consecutivos completados terminando hoy (o ayer si hoy aún no). */
export function currentStreak(log: string[]): number {
  const set = new Set(log)
  const cursor = new Date()
  // Si hoy no está marcado, la racha aún puede venir desde ayer.
  if (!set.has(dayISO(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (set.has(dayISO(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Progreso (0-100) del reto de 30 días: marcas en los últimos 30 días sobre el total posible. */
export function challengeProgress(habits: { log: string[] }[]): number {
  if (habits.length === 0) return 0
  const recent = new Set<string>()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  const window: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    window.push(dayISO(d))
    recent.add(dayISO(d))
  }
  let done = 0
  for (const h of habits) for (const day of h.log) if (recent.has(day)) done += 1
  const possible = habits.length * 30
  return Math.min(100, Math.round((done / possible) * 100))
}
