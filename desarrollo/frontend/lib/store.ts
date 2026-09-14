'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, toLocalISO } from './cycle'
import { BUDGET_TEMPLATES, type BudgetKind } from './budget'

/* ---------- Types ---------- */

export type Priority = 'alta' | 'media' | 'baja'

export interface Task {
  id: string
  title: string
  time?: string
  done: boolean
  priority: Priority
  area: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  goal: number // times per week
  /** ISO date strings (yyyy-mm-dd) on which the habit was completed */
  log: string[]
}

export interface LifeArea {
  id: string
  label: string
  score: number // 1-10
  color: string
}

/** Snapshot mensual de la Rueda de la Vida (M10). */
export interface WheelSnapshot {
  date: string // yyyy-mm
  scores: Record<string, number> // areaId -> score
}

/* ---------- Ciclo menstrual ---------- */

export type Flow = 'ligero' | 'medio' | 'abundante'

export interface CycleDayLog {
  date: string // yyyy-mm-dd
  flow?: Flow
  mood?: string
  symptoms: string[]
}

/* ---------- Bienestar (mood · agua · sueño · fitness) ---------- */

export type MoodKey = 'feliz' | 'tranquila' | 'cansada' | 'triste' | 'ansiosa' | 'enojada'

export type SleepQuality = 'excelente' | 'bien' | 'regular' | 'mal'

export interface SleepEntry {
  hours: number
  quality: SleepQuality
}

export interface Workout {
  id: string
  date: string // yyyy-mm-dd
  type: string
  minutes: number
}

export interface WeightEntry {
  date: string // yyyy-mm-dd
  kg: number
}

/* ---------- Recetas ---------- */

export type RecipeKind = 'manual' | 'pdf'

export interface Recipe {
  id: string
  kind: RecipeKind
  title: string
  category: string
  ingredients: string // manual · multilínea
  steps: string // manual · multilínea
  time: string
  servings: string
  fileName: string // pdf · nombre del archivo (blob en IndexedDB por id)
  createdAt: string
}

/* ---------- Planeador · vista mensual ---------- */

export interface MonthGoal {
  id: string
  title: string
  done: boolean
}

export interface MonthMeta {
  project: string
  motivation: string
  challenge: string
}

export type TxType = 'gasto' | 'ingreso'
export type FinScope = 'personal' | 'compartida'

export interface Transaction {
  id: string
  concept: string
  amount: number
  type: TxType
  category: string
  payer: 'tu' | 'pareja'
  scope: FinScope
  date: string
}

/* ---------- Presupuesto e inversiones ---------- */

export interface BudgetBucket {
  id: string
  name: string
  pct: number
  color: string
  kind: BudgetKind
}

export interface Investment {
  id: string
  name: string
  type: string // Acciones, Fondos, Cripto, Inmobiliario, Pensiones, Otro
  amount: number // capital invertido
  value: number // valor actual
  scope: FinScope
}

/* ---------- M04 · Centro de Mando del Hogar ---------- */

export type Freq = 'diaria' | 'semanal' | 'mensual'

export interface Chore {
  id: string
  title: string
  zone: string
  freq: Freq
  assignee: 'tu' | 'pareja'
  done: boolean
}

export interface InventoryItem {
  id: string
  name: string
  qty: number
  threshold: number
}

/* ---------- M06 · Descarga Mental ---------- */

export interface Note {
  id: string
  text: string
  color: string
  category: string
  date: string
}

/* ---------- M07 · Familia y Mellizos ---------- */

export interface FamilyMember {
  id: string
  name: string
  role: string
  bloodType: string
  allergies: string
  doctor: string
}

export interface Contact {
  id: string
  name: string
  relation: string
  phone: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  done: boolean
}

/* ---------- M08 · Investigación y Docencia ---------- */

export type ResearchStatus = 'borrador' | 'revision' | 'enviado' | 'publicado'

export interface Research {
  id: string
  title: string
  status: ResearchStatus
  tag: string
}

export interface JournalEntry {
  id: string
  date: string
  project: string
  field: string
  notes: string
}

/* ---------- M09 · Eventos con IA ---------- */

export type GuestStatus = 'si' | 'no' | 'pendiente'

export interface ChecklistItem {
  id: string
  text: string
  category: string
  done: boolean
}

export interface Guest {
  id: string
  name: string
  status: GuestStatus
}

export interface ThemisEvent {
  id: string
  name: string
  items: ChecklistItem[]
  guests: Guest[]
  createdAt: string
}

interface ThemisState {
  userName: string
  setUserName: (name: string) => void

  tasks: Task[]
  addTask: (t: Omit<Task, 'id' | 'done'>) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void

  habits: Habit[]
  toggleHabitDay: (habitId: string, date: string) => void
  addHabit: (h: Omit<Habit, 'id' | 'log'>) => void

  // M01 · "Hoy me propongo" (3 prioridades editables)
  intentions: string[]
  setIntention: (index: number, text: string) => void

  // Ciclo menstrual
  cycleAvgLength: number
  periodLength: number
  periodStarts: string[]
  cycleLogs: CycleDayLog[]
  togglePeriodStart: (date: string) => void
  setCycleSettings: (avgLength: number, periodLength: number) => void
  upsertCycleLog: (log: CycleDayLog) => void

  // Bienestar
  moodLog: Record<string, MoodKey>
  setMood: (date: string, mood: MoodKey) => void
  waterGoal: number
  waterLog: Record<string, number>
  setWater: (date: string, glasses: number) => void
  setWaterGoal: (n: number) => void
  sleepLog: Record<string, SleepEntry>
  setSleep: (date: string, entry: SleepEntry) => void
  fitnessGoal: number // sesiones por semana
  setFitnessGoal: (n: number) => void
  workouts: Workout[]
  addWorkout: (w: Omit<Workout, 'id'>) => void
  removeWorkout: (id: string) => void
  weightLog: WeightEntry[]
  addWeight: (kg: number) => void
  removeWeight: (date: string) => void
  measurements: Record<string, number>
  setMeasurement: (part: string, cm: number) => void

  // Planeador · mes
  monthGoals: MonthGoal[]
  addMonthGoal: (title: string) => void
  toggleMonthGoal: (id: string) => void
  removeMonthGoal: (id: string) => void
  monthMeta: MonthMeta
  setMonthMeta: (field: keyof MonthMeta, value: string) => void

  // Recetas
  recipes: Recipe[]
  addRecipe: (r: Omit<Recipe, 'id' | 'createdAt'>) => string
  updateRecipe: (id: string, patch: Partial<Omit<Recipe, 'id'>>) => void
  removeRecipe: (id: string) => void

  lifeAreas: LifeArea[]
  setAreaScore: (id: string, score: number) => void
  // M10 · historial y reflexión de la Rueda
  wheelHistory: WheelSnapshot[]
  saveWheel: () => void
  wheelReflection: string
  setWheelReflection: (text: string) => void

  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  // M05 · plan de ahorro (tarro)
  savingsGoal: number
  saved: number
  setSavingsGoal: (n: number) => void
  addToSavings: (n: number) => void
  // M05 · presupuesto personal + compartido
  mySalary: number
  mySharePct: number // % de mi sueldo que aporto al fondo compartido
  partnerSalary: number
  partnerSharePct: number // % del sueldo de la pareja al fondo compartido
  personalTemplate: string
  personalBuckets: BudgetBucket[] // presupuesto sobre mi disponible (sueldo − aporte)
  sharedBuckets: BudgetBucket[] // desglose del fondo compartido
  setMySalary: (n: number) => void
  setMySharePct: (n: number) => void
  setPartnerSalary: (n: number) => void
  setPartnerSharePct: (n: number) => void
  applyPersonalTemplate: (templateId: string) => void
  setPersonalBucketPct: (id: string, pct: number) => void
  addSharedBucket: (name: string) => void
  setSharedBucketPct: (id: string, pct: number) => void
  removeSharedBucket: (id: string) => void
  // M05 · inversiones
  investments: Investment[]
  addInvestment: (inv: Omit<Investment, 'id'>) => void
  updateInvestmentValue: (id: string, value: number) => void
  removeInvestment: (id: string) => void

  // M04 · Hogar
  chores: Chore[]
  addChore: (c: Omit<Chore, 'id' | 'done'>) => void
  toggleChore: (id: string) => void
  removeChore: (id: string) => void
  inventory: InventoryItem[]
  setInventoryQty: (id: string, qty: number) => void

  // M06 · Descarga Mental
  notes: Note[]
  addNote: (n: Omit<Note, 'id' | 'date'>) => void
  removeNote: (id: string) => void

  // M07 · Familia
  family: FamilyMember[]
  contacts: Contact[]
  addContact: (c: Omit<Contact, 'id'>) => void
  removeContact: (id: string) => void
  milestones: Milestone[]
  addMilestone: (m: Omit<Milestone, 'id' | 'done'>) => void
  toggleMilestone: (id: string) => void

  // M08 · Académico
  researches: Research[]
  addResearch: (r: Omit<Research, 'id'>) => void
  cycleResearchStatus: (id: string) => void
  removeResearch: (id: string) => void
  journal: JournalEntry[]
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'date'>) => void

  // M09 · Eventos con IA
  events: ThemisEvent[]
  addEvent: (name: string, items: Omit<ChecklistItem, 'id' | 'done'>[]) => string
  toggleEventItem: (eventId: string, itemId: string) => void
  addEventItem: (eventId: string, text: string, category: string) => void
  removeEventItem: (eventId: string, itemId: string) => void
  addGuest: (eventId: string, name: string) => void
  cycleGuestStatus: (eventId: string, guestId: string) => void
  removeEvent: (id: string) => void

  resetAll: () => void
}

/* ---------- Helpers ---------- */

export const todayISO = () => new Date().toISOString().slice(0, 10)
const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------- Seed data ---------- */

const seedTasks: Task[] = [
  { id: uid(), title: 'Reunión equipo de docencia', time: '09:00', done: false, priority: 'alta', area: 'Trabajo' },
  { id: uid(), title: 'Llevar a los mellizos al pediatra', time: '11:30', done: false, priority: 'alta', area: 'Familia' },
  { id: uid(), title: 'Revisar presupuesto del mes', time: '15:00', done: true, priority: 'media', area: 'Finanzas' },
  { id: uid(), title: 'Yoga + meditación', time: '19:00', done: false, priority: 'baja', area: 'Bienestar' },
]

const seedHabits: Habit[] = [
  { id: uid(), name: 'Beber agua', icon: 'Droplet', color: 'mint', goal: 7, log: [] },
  { id: uid(), name: 'Meditar', icon: 'Sparkles', color: 'violet', goal: 5, log: [] },
  { id: uid(), name: 'Leer 20 min', icon: 'BookOpen', color: 'sun', goal: 4, log: [] },
  { id: uid(), name: 'Ejercicio', icon: 'Activity', color: 'coral', goal: 3, log: [] },
]

const seedAreas: LifeArea[] = [
  { id: 'salud', label: 'Salud', score: 7, color: 'mint' },
  { id: 'familia', label: 'Familia', score: 9, color: 'rose' },
  { id: 'carrera', label: 'Carrera', score: 6, color: 'violet' },
  { id: 'finanzas', label: 'Finanzas', score: 5, color: 'sun' },
  { id: 'ocio', label: 'Ocio', score: 4, color: 'coral' },
  { id: 'crecimiento', label: 'Crecimiento', score: 8, color: 'sage' },
  { id: 'pareja', label: 'Pareja', score: 7, color: 'lila' },
  { id: 'social', label: 'Social', score: 6, color: 'navy' },
]

const seedTx: Transaction[] = [
  // Compartidos (fondo común)
  { id: uid(), concept: 'Arriendo piso', amount: 850, type: 'gasto', category: 'Arriendo', payer: 'tu', scope: 'compartida', date: todayISO() },
  { id: uid(), concept: 'Luz y agua', amount: 120, type: 'gasto', category: 'Servicios', payer: 'pareja', scope: 'compartida', date: todayISO() },
  { id: uid(), concept: 'Compra supermercado', amount: 124.5, type: 'gasto', category: 'Alimentación', payer: 'tu', scope: 'compartida', date: todayISO() },
  { id: uid(), concept: 'Guardería mellizos', amount: 380, type: 'gasto', category: 'Educación hijos', payer: 'pareja', scope: 'compartida', date: todayISO() },
  // Personales
  { id: uid(), concept: 'Salario', amount: 2500, type: 'ingreso', category: 'Trabajo', payer: 'tu', scope: 'personal', date: todayISO() },
  { id: uid(), concept: 'Cena con amigas', amount: 38, type: 'gasto', category: 'Ocio', payer: 'tu', scope: 'personal', date: todayISO() },
  { id: uid(), concept: 'Ropa', amount: 60, type: 'gasto', category: 'Otros', payer: 'tu', scope: 'personal', date: todayISO() },
  { id: uid(), concept: 'Farmacia', amount: 18, type: 'gasto', category: 'Salud', payer: 'tu', scope: 'personal', date: todayISO() },
]

const seedChores: Chore[] = [
  { id: uid(), title: 'Limpiar cocina', zone: 'Cocina', freq: 'diaria', assignee: 'tu', done: false },
  { id: uid(), title: 'Baño completo', zone: 'Baño', freq: 'semanal', assignee: 'pareja', done: false },
  { id: uid(), title: 'Aspirar sala', zone: 'Sala', freq: 'semanal', assignee: 'tu', done: true },
  { id: uid(), title: 'Cambiar sábanas', zone: 'Habitaciones', freq: 'semanal', assignee: 'pareja', done: false },
  { id: uid(), title: 'Sacar basura', zone: 'Cocina', freq: 'diaria', assignee: 'pareja', done: false },
]

const seedInventory: InventoryItem[] = [
  { id: uid(), name: 'Papel higiénico', qty: 8, threshold: 4 },
  { id: uid(), name: 'Detergente', qty: 1, threshold: 1 },
  { id: uid(), name: 'Pañales', qty: 12, threshold: 10 },
  { id: uid(), name: 'Leche', qty: 2, threshold: 2 },
]

const seedNotes: Note[] = [
  { id: uid(), text: 'Llamar a mamá este fin de semana 💛', color: 'lila', category: 'Pendiente', date: todayISO() },
  { id: uid(), text: 'Hoy agradezco el café tranquilo de la mañana', color: 'sun', category: 'Gratitud', date: todayISO() },
  { id: uid(), text: 'Necesito soltar la culpa por descansar', color: 'rose', category: 'Soltar', date: todayISO() },
]

const seedFamily: FamilyMember[] = [
  { id: uid(), name: 'Lucas', role: 'Mellizo', bloodType: 'O+', allergies: 'Ninguna', doctor: 'Dra. Pérez' },
  { id: uid(), name: 'Mía', role: 'Melliza', bloodType: 'O+', allergies: 'Penicilina', doctor: 'Dra. Pérez' },
]

const seedContacts: Contact[] = [
  { id: uid(), name: 'Abuela Rosa', relation: 'Familia', phone: '600 123 456' },
  { id: uid(), name: 'Carmen (niñera)', relation: 'Apoyo', phone: '600 987 654' },
  { id: uid(), name: 'Dra. Pérez', relation: 'Pediatra', phone: '900 111 222' },
]

const seedMilestones: Milestone[] = [
  { id: uid(), title: 'Primeros pasos', date: '2026-03-12', done: true },
  { id: uid(), title: 'Primera palabra', date: '2026-05-02', done: true },
  { id: uid(), title: 'Control de esfínteres', date: '', done: false },
]

const seedResearches: Research[] = [
  { id: uid(), title: 'Carga mental y docencia', status: 'revision', tag: 'USB' },
  { id: uid(), title: 'Aprendizaje en mellizos', status: 'borrador', tag: 'Tesis' },
  { id: uid(), title: 'Evaluación formativa', status: 'publicado', tag: 'Artículo' },
]

const seedJournal: JournalEntry[] = [
  { id: uid(), date: todayISO(), project: 'Aula 3°B', field: 'Lenguaje', notes: 'Buena participación en lectura compartida.' },
]

const seedEvents: ThemisEvent[] = [
  {
    id: uid(),
    name: 'Cumpleaños de los mellizos',
    createdAt: todayISO(),
    items: [
      { id: uid(), text: 'Reservar salón', category: 'Logística', done: true },
      { id: uid(), text: 'Encargar tarta', category: 'Comida', done: false },
      { id: uid(), text: 'Comprar decoración', category: 'Decoración', done: false },
      { id: uid(), text: 'Enviar invitaciones', category: 'Invitados', done: false },
    ],
    guests: [
      { id: uid(), name: 'Abuela Rosa', status: 'si' },
      { id: uid(), name: 'Familia Gómez', status: 'pendiente' },
    ],
  },
]

// Dos ciclos de ejemplo: regla actual hace 12 días y la anterior hace 40.
const seedPeriodStarts: string[] = [
  toLocalISO(addDays(new Date(), -40)),
  toLocalISO(addDays(new Date(), -12)),
]

const bucketsFromTemplate = (templateId: string): BudgetBucket[] => {
  const tpl = BUDGET_TEMPLATES.find((t) => t.id === templateId) ?? BUDGET_TEMPLATES[0]
  return tpl.buckets.map((b) => ({ ...b, id: uid() }))
}

const SEED_TEMPLATE = '50-30-20'
const seedPersonalBuckets = bucketsFromTemplate(SEED_TEMPLATE)
const seedSharedBuckets: BudgetBucket[] = [
  { id: uid(), name: 'Arriendo', pct: 35, color: 'coral', kind: 'gastos' },
  { id: uid(), name: 'Servicios', pct: 15, color: 'sun', kind: 'gastos' },
  { id: uid(), name: 'Alimentación', pct: 20, color: 'mint', kind: 'gastos' },
  { id: uid(), name: 'Educación hijos', pct: 20, color: 'sage', kind: 'gastos' },
  { id: uid(), name: 'Ahorro común', pct: 10, color: 'violet', kind: 'gastos' },
]

const seedInvestments: Investment[] = [
  { id: uid(), name: 'Fondo indexado MSCI World', type: 'Fondos', amount: 3000, value: 3420, scope: 'personal' },
  { id: uid(), name: 'Acciones tecnológicas', type: 'Acciones', amount: 1500, value: 1380, scope: 'personal' },
  { id: uid(), name: 'Bitcoin', type: 'Cripto', amount: 800, value: 1120, scope: 'personal' },
  { id: uid(), name: 'Fondo emergencia familiar', type: 'Fondos', amount: 2200, value: 2310, scope: 'compartida' },
  { id: uid(), name: 'Plan pensiones conjunto', type: 'Pensiones', amount: 1800, value: 1890, scope: 'compartida' },
]

const seedWorkouts: Workout[] = [
  { id: uid(), date: toLocalISO(addDays(new Date(), -1)), type: 'Yoga', minutes: 30 },
  { id: uid(), date: toLocalISO(addDays(new Date(), -3)), type: 'Caminata', minutes: 45 },
]

const seedWeight: WeightEntry[] = [
  { date: toLocalISO(addDays(new Date(), -60)), kg: 66 },
  { date: toLocalISO(addDays(new Date(), -30)), kg: 65.2 },
  { date: toLocalISO(addDays(new Date(), -7)), kg: 64.6 },
]

const seedMeasurements: Record<string, number> = {
  Cuello: 33,
  Pecho: 90,
  Brazo: 28,
  Cintura: 72,
  Cadera: 98,
  Pierna: 55,
  Pantorrilla: 35,
}

const seedMonthGoals: MonthGoal[] = [
  { id: uid(), title: 'Cerrar informe trimestral', done: false },
  { id: uid(), title: 'Organizar cumpleaños mellizos', done: false },
  { id: uid(), title: 'Revisión médica anual', done: true },
  { id: uid(), title: 'Retomar clases de francés', done: false },
]

const seedRecipes: Recipe[] = [
  {
    id: uid(),
    kind: 'manual',
    title: 'Bowl de avena y frutos rojos',
    category: 'Desayuno',
    ingredients: '1/2 taza de avena\n1 taza de leche\nFrutos rojos\n1 cda de miel\nSemillas de chía',
    steps: 'Cocina la avena con la leche 5 min.\nSirve en un bowl.\nAgrega frutos rojos, miel y chía.',
    time: '10 min',
    servings: '1',
    fileName: '',
    createdAt: todayISO(),
  },
  {
    id: uid(),
    kind: 'manual',
    title: 'Pasta al pesto rápida',
    category: 'Almuerzo',
    ingredients: '200 g de pasta\n2 cdas de pesto\nTomates cherry\nParmesano\nAlbahaca',
    steps: 'Hierve la pasta.\nMezcla con el pesto.\nAgrega tomates y parmesano.',
    time: '20 min',
    servings: '2',
    fileName: '',
    createdAt: todayISO(),
  },
]

/* ---------- Store ---------- */

export const useThemis = create<ThemisState>()(
  persist(
    (set) => ({
      userName: 'Jane',
      setUserName: (name) => set({ userName: name }),

      intentions: ['', '', ''],
      setIntention: (index, text) =>
        set((s) => {
          const next = [...s.intentions]
          next[index] = text
          return { intentions: next }
        }),

      cycleAvgLength: 28,
      periodLength: 5,
      periodStarts: seedPeriodStarts,
      cycleLogs: [],
      togglePeriodStart: (date) =>
        set((s) => ({
          periodStarts: s.periodStarts.includes(date)
            ? s.periodStarts.filter((d) => d !== date)
            : [...s.periodStarts, date].sort(),
        })),
      setCycleSettings: (avgLength, periodLength) =>
        set({
          cycleAvgLength: Math.min(45, Math.max(20, avgLength)),
          periodLength: Math.min(10, Math.max(1, periodLength)),
        }),
      upsertCycleLog: (log) =>
        set((s) => {
          const rest = s.cycleLogs.filter((l) => l.date !== log.date)
          const empty = !log.flow && !log.mood && log.symptoms.length === 0
          return { cycleLogs: empty ? rest : [log, ...rest] }
        }),

      // Bienestar
      moodLog: {},
      setMood: (date, mood) => set((s) => ({ moodLog: { ...s.moodLog, [date]: mood } })),
      waterGoal: 8,
      waterLog: {},
      setWater: (date, glasses) =>
        set((s) => ({ waterLog: { ...s.waterLog, [date]: Math.max(0, glasses) } })),
      setWaterGoal: (n) => set({ waterGoal: Math.min(20, Math.max(1, n)) }),
      sleepLog: {},
      setSleep: (date, entry) => set((s) => ({ sleepLog: { ...s.sleepLog, [date]: entry } })),
      fitnessGoal: 4,
      setFitnessGoal: (n) => set({ fitnessGoal: Math.min(14, Math.max(1, n)) }),
      workouts: seedWorkouts,
      addWorkout: (w) => set((s) => ({ workouts: [{ ...w, id: uid() }, ...s.workouts] })),
      removeWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
      weightLog: seedWeight,
      addWeight: (kg) =>
        set((s) => {
          const date = toLocalISO(new Date())
          const rest = s.weightLog.filter((w) => w.date !== date)
          return { weightLog: [...rest, { date, kg }].sort((a, b) => a.date.localeCompare(b.date)) }
        }),
      removeWeight: (date) => set((s) => ({ weightLog: s.weightLog.filter((w) => w.date !== date) })),
      measurements: seedMeasurements,
      setMeasurement: (part, cm) =>
        set((s) => ({ measurements: { ...s.measurements, [part]: Math.max(0, cm) } })),

      // Planeador · mes
      monthGoals: seedMonthGoals,
      addMonthGoal: (title) =>
        set((s) => ({ monthGoals: [...s.monthGoals, { id: uid(), title, done: false }] })),
      toggleMonthGoal: (id) =>
        set((s) => ({
          monthGoals: s.monthGoals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
        })),
      removeMonthGoal: (id) =>
        set((s) => ({ monthGoals: s.monthGoals.filter((g) => g.id !== id) })),
      monthMeta: { project: '', motivation: '', challenge: '' },
      setMonthMeta: (field, value) =>
        set((s) => ({ monthMeta: { ...s.monthMeta, [field]: value } })),

      // Recetas
      recipes: seedRecipes,
      addRecipe: (r) => {
        const id = uid()
        set((s) => ({ recipes: [{ ...r, id, createdAt: todayISO() }, ...s.recipes] }))
        return id
      },
      updateRecipe: (id, patch) =>
        set((s) => ({ recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

      tasks: seedTasks,
      addTask: (t) => set((s) => ({ tasks: [{ ...t, id: uid(), done: false }, ...s.tasks] })),
      toggleTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      habits: seedHabits,
      toggleHabitDay: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  log: h.log.includes(date)
                    ? h.log.filter((d) => d !== date)
                    : [...h.log, date],
                }
              : h,
          ),
        })),
      addHabit: (h) => set((s) => ({ habits: [...s.habits, { ...h, id: uid(), log: [] }] })),

      lifeAreas: seedAreas,
      setAreaScore: (id, score) =>
        set((s) => ({ lifeAreas: s.lifeAreas.map((a) => (a.id === id ? { ...a, score } : a)) })),
      wheelHistory: [],
      saveWheel: () =>
        set((s) => {
          const month = new Date().toISOString().slice(0, 7) // yyyy-mm
          const scores = Object.fromEntries(s.lifeAreas.map((a) => [a.id, a.score]))
          const rest = s.wheelHistory.filter((h) => h.date !== month)
          return { wheelHistory: [...rest, { date: month, scores }].slice(-12) }
        }),
      wheelReflection: '',
      setWheelReflection: (text) => set({ wheelReflection: text }),

      transactions: seedTx,
      addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      savingsGoal: 3000,
      saved: 1200,
      setSavingsGoal: (n) => set({ savingsGoal: Math.max(1, n) }),
      addToSavings: (n) => set((s) => ({ saved: Math.max(0, s.saved + n) })),

      mySalary: 2500,
      mySharePct: 30,
      partnerSalary: 2200,
      partnerSharePct: 35,
      personalTemplate: SEED_TEMPLATE,
      personalBuckets: seedPersonalBuckets,
      sharedBuckets: seedSharedBuckets,
      setMySalary: (n) => set({ mySalary: Math.max(0, n) }),
      setMySharePct: (n) => set({ mySharePct: Math.min(100, Math.max(0, n)) }),
      setPartnerSalary: (n) => set({ partnerSalary: Math.max(0, n) }),
      setPartnerSharePct: (n) => set({ partnerSharePct: Math.min(100, Math.max(0, n)) }),
      applyPersonalTemplate: (templateId) =>
        set({ personalTemplate: templateId, personalBuckets: bucketsFromTemplate(templateId) }),
      setPersonalBucketPct: (id, pct) =>
        set((s) => ({
          personalBuckets: s.personalBuckets.map((b) =>
            b.id === id ? { ...b, pct: Math.min(100, Math.max(0, pct)) } : b,
          ),
        })),
      addSharedBucket: (name) =>
        set((s) => ({
          sharedBuckets: [
            ...s.sharedBuckets,
            { id: uid(), name, pct: 0, color: 'lila', kind: 'gastos' },
          ],
        })),
      setSharedBucketPct: (id, pct) =>
        set((s) => ({
          sharedBuckets: s.sharedBuckets.map((b) =>
            b.id === id ? { ...b, pct: Math.min(100, Math.max(0, pct)) } : b,
          ),
        })),
      removeSharedBucket: (id) =>
        set((s) => ({ sharedBuckets: s.sharedBuckets.filter((b) => b.id !== id) })),

      investments: seedInvestments,
      addInvestment: (inv) => set((s) => ({ investments: [{ ...inv, id: uid() }, ...s.investments] })),
      updateInvestmentValue: (id, value) =>
        set((s) => ({
          investments: s.investments.map((i) => (i.id === id ? { ...i, value: Math.max(0, value) } : i)),
        })),
      removeInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),

      // M04 · Hogar
      chores: seedChores,
      addChore: (c) => set((s) => ({ chores: [{ ...c, id: uid(), done: false }, ...s.chores] })),
      toggleChore: (id) =>
        set((s) => ({ chores: s.chores.map((c) => (c.id === id ? { ...c, done: !c.done } : c)) })),
      removeChore: (id) => set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),
      inventory: seedInventory,
      setInventoryQty: (id, qty) =>
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i)),
        })),

      // M06 · Descarga Mental
      notes: seedNotes,
      addNote: (n) => set((s) => ({ notes: [{ ...n, id: uid(), date: todayISO() }, ...s.notes] })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // M07 · Familia
      family: seedFamily,
      contacts: seedContacts,
      addContact: (c) => set((s) => ({ contacts: [{ ...c, id: uid() }, ...s.contacts] })),
      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
      milestones: seedMilestones,
      addMilestone: (m) =>
        set((s) => ({ milestones: [...s.milestones, { ...m, id: uid(), done: false }] })),
      toggleMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
        })),

      // M08 · Académico
      researches: seedResearches,
      addResearch: (r) => set((s) => ({ researches: [{ ...r, id: uid() }, ...s.researches] })),
      cycleResearchStatus: (id) =>
        set((s) => {
          const order: ResearchStatus[] = ['borrador', 'revision', 'enviado', 'publicado']
          return {
            researches: s.researches.map((r) =>
              r.id === id
                ? { ...r, status: order[(order.indexOf(r.status) + 1) % order.length] }
                : r,
            ),
          }
        }),
      removeResearch: (id) => set((s) => ({ researches: s.researches.filter((r) => r.id !== id) })),
      journal: seedJournal,
      addJournalEntry: (e) =>
        set((s) => ({ journal: [{ ...e, id: uid(), date: todayISO() }, ...s.journal] })),

      // M09 · Eventos con IA
      events: seedEvents,
      addEvent: (name, items) => {
        const id = uid()
        set((s) => ({
          events: [
            {
              id,
              name,
              createdAt: todayISO(),
              items: items.map((it) => ({ ...it, id: uid(), done: false })),
              guests: [],
            },
            ...s.events,
          ],
        }))
        return id
      },
      toggleEventItem: (eventId, itemId) =>
        set((s) => ({
          events: s.events.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  items: ev.items.map((it) =>
                    it.id === itemId ? { ...it, done: !it.done } : it,
                  ),
                }
              : ev,
          ),
        })),
      addEventItem: (eventId, text, category) =>
        set((s) => ({
          events: s.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, items: [...ev.items, { id: uid(), text, category, done: false }] }
              : ev,
          ),
        })),
      removeEventItem: (eventId, itemId) =>
        set((s) => ({
          events: s.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, items: ev.items.filter((it) => it.id !== itemId) }
              : ev,
          ),
        })),
      addGuest: (eventId, name) =>
        set((s) => ({
          events: s.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, guests: [...ev.guests, { id: uid(), name, status: 'pendiente' }] }
              : ev,
          ),
        })),
      cycleGuestStatus: (eventId, guestId) =>
        set((s) => {
          const order: GuestStatus[] = ['pendiente', 'si', 'no']
          return {
            events: s.events.map((ev) =>
              ev.id === eventId
                ? {
                    ...ev,
                    guests: ev.guests.map((g) =>
                      g.id === guestId
                        ? { ...g, status: order[(order.indexOf(g.status) + 1) % order.length] }
                        : g,
                    ),
                  }
                : ev,
            ),
          }
        }),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((ev) => ev.id !== id) })),

      resetAll: () =>
        set({
          intentions: ['', '', ''],
          cycleAvgLength: 28,
          periodLength: 5,
          periodStarts: seedPeriodStarts,
          cycleLogs: [],
          moodLog: {},
          waterGoal: 8,
          waterLog: {},
          sleepLog: {},
          fitnessGoal: 4,
          workouts: seedWorkouts,
          weightLog: seedWeight,
          measurements: seedMeasurements,
          monthGoals: seedMonthGoals,
          monthMeta: { project: '', motivation: '', challenge: '' },
          recipes: seedRecipes,
          tasks: seedTasks,
          habits: seedHabits,
          lifeAreas: seedAreas,
          wheelHistory: [],
          wheelReflection: '',
          transactions: seedTx,
          savingsGoal: 3000,
          saved: 1200,
          mySalary: 2500,
          mySharePct: 30,
          partnerSalary: 2200,
          partnerSharePct: 35,
          personalTemplate: SEED_TEMPLATE,
          personalBuckets: bucketsFromTemplate(SEED_TEMPLATE),
          sharedBuckets: seedSharedBuckets,
          investments: seedInvestments,
          chores: seedChores,
          inventory: seedInventory,
          notes: seedNotes,
          family: seedFamily,
          contacts: seedContacts,
          milestones: seedMilestones,
          researches: seedResearches,
          journal: seedJournal,
          events: seedEvents,
        }),
    }),
    { name: 'themis-store' },
  ),
)
