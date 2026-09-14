/** Plantillas de presupuesto y utilidades (módulo Finanzas).
 *  Porcentajes basados en marcos de finanzas personales reconocidos.
 *  Lógica pura, sin DOM — lista para React Native. */

export type BudgetKind =
  | 'necesidades'
  | 'deseos'
  | 'gastos'
  | 'ahorro'
  | 'inversion'
  | 'deudas'
  | 'educacion'
  | 'donacion'

export interface TemplateBucket {
  name: string
  pct: number
  color: string
  kind: BudgetKind
}

export interface BudgetTemplate {
  id: string
  name: string
  source: string
  desc: string
  buckets: TemplateBucket[]
}

export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: '50-30-20',
    name: 'Regla 50/30/20',
    source: 'Elizabeth Warren',
    desc: 'La más popular y equilibrada. Ideal para empezar.',
    buckets: [
      { name: 'Necesidades', pct: 50, color: 'coral', kind: 'necesidades' },
      { name: 'Deseos', pct: 30, color: 'sun', kind: 'deseos' },
      { name: 'Ahorro', pct: 20, color: 'mint', kind: 'ahorro' },
    ],
  },
  {
    id: '70-20-10',
    name: 'Regla 70/20/10',
    source: 'Finanzas personales',
    desc: 'Sencilla, prioriza vivir el presente con colchón.',
    buckets: [
      { name: 'Gastos de vida', pct: 70, color: 'coral', kind: 'gastos' },
      { name: 'Ahorro', pct: 20, color: 'mint', kind: 'ahorro' },
      { name: 'Deudas', pct: 10, color: 'rose', kind: 'deudas' },
    ],
  },
  {
    id: '80-20',
    name: 'Regla 80/20',
    source: '“Págate primero” (Bach)',
    desc: 'Minimalista: aparta el 20% antes de gastar.',
    buckets: [
      { name: 'Gastos', pct: 80, color: 'coral', kind: 'gastos' },
      { name: 'Ahorro', pct: 20, color: 'mint', kind: 'ahorro' },
    ],
  },
  {
    id: '6-jarras',
    name: 'Método 6 Jarras',
    source: 'T. Harv Eker',
    desc: 'Para crecimiento financiero: incluye inversión y educación.',
    buckets: [
      { name: 'Necesidades', pct: 55, color: 'coral', kind: 'necesidades' },
      { name: 'Libertad financiera', pct: 10, color: 'violet', kind: 'inversion' },
      { name: 'Ahorro largo plazo', pct: 10, color: 'mint', kind: 'ahorro' },
      { name: 'Educación', pct: 10, color: 'sage', kind: 'educacion' },
      { name: 'Ocio', pct: 10, color: 'sun', kind: 'deseos' },
      { name: 'Donación', pct: 5, color: 'lila', kind: 'donacion' },
    ],
  },
]

/** Mapea cada categoría de gasto a un tipo de necesidad/deseo. */
const CATEGORY_KIND: Record<string, 'necesidades' | 'deseos'> = {
  Hogar: 'necesidades',
  Familia: 'necesidades',
  Salud: 'necesidades',
  Trabajo: 'necesidades',
  Ocio: 'deseos',
  Otros: 'deseos',
}

export const spendingKind = (category: string): 'necesidades' | 'deseos' =>
  CATEGORY_KIND[category] ?? 'deseos'

export interface BudgetActuals {
  necesidades: number
  deseos: number
  totalSpent: number
  income: number
  invested: number
}

/** Importe real asignado a un bucket según su tipo. */
export function actualForKind(kind: BudgetKind, a: BudgetActuals): number {
  switch (kind) {
    case 'necesidades':
      return a.necesidades
    case 'deseos':
      return a.deseos
    case 'gastos':
      return a.totalSpent
    case 'ahorro':
      return Math.max(0, a.income - a.totalSpent)
    case 'inversion':
      return a.invested
    default:
      return 0 // deudas, educación, donación: sin datos automáticos
  }
}

export const BUDGET_COLOR: Record<string, string> = {
  coral: 'var(--coral)',
  sun: 'var(--sun)',
  mint: 'var(--mint)',
  violet: 'var(--violet)',
  rose: 'var(--rose)',
  sage: 'var(--sage)',
  lila: 'var(--lila)',
}
