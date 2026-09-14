'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, X } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { GreetingHeader } from '@/components/greeting-header'
import { BudgetSection } from '@/components/finance/budget-section'
import { DistributionChart } from '@/components/finance/distribution-chart'
import { SavingsJar } from '@/components/finance/savings-jar'
import { Investments } from '@/components/finance/investments'
import { MonthlyMeeting } from '@/components/finance/monthly-meeting'
import { useThemis, todayISO, type TxType, type FinScope } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Hogar', 'Familia', 'Ocio', 'Trabajo', 'Salud', 'Otros']
type Scope = FinScope
const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export default function FinanzasPage() {
  const hydrated = useHydrated()
  const transactions = useThemis((s) => s.transactions)
  const addTransaction = useThemis((s) => s.addTransaction)
  const removeTransaction = useThemis((s) => s.removeTransaction)
  const sharedBuckets = useThemis((s) => s.sharedBuckets)

  const [scope, setScope] = useState<Scope>('compartida')
  const [open, setOpen] = useState(false)
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TxType>('gasto')
  const [category, setCategory] = useState('Hogar')
  const [payer, setPayer] = useState<'tu' | 'pareja'>('tu')

  // Categorías según la pestaña: personales genéricas vs. del fondo compartido.
  const categoryOptions = useMemo(
    () => (scope === 'compartida' ? sharedBuckets.map((b) => b.name) : CATEGORIES),
    [scope, sharedBuckets],
  )
  // Al cambiar de pestaña, ajusta la categoría seleccionada a una válida.
  useEffect(() => {
    setCategory(categoryOptions[0] ?? 'Otros')
  }, [scope]) // eslint-disable-line react-hooks/exhaustive-deps

  // Movimientos de la pestaña activa (personal o compartida).
  const visible = useMemo(
    () => transactions.filter((t) => (t.scope ?? 'personal') === scope),
    [transactions, scope],
  )

  const { income, expense, byCategory } = useMemo(() => {
    let income = 0
    let expense = 0
    const cat: Record<string, number> = {}
    for (const t of visible) {
      if (t.type === 'ingreso') income += t.amount
      else {
        expense += t.amount
        cat[t.category] = (cat[t.category] ?? 0) + t.amount
      }
    }
    const byCategory = Object.entries(cat).map(([name, value]) => ({ name, value }))
    return { income, expense, byCategory }
  }, [visible])

  const balance = income - expense
  const palette = ['var(--violet)', 'var(--mint)', 'var(--sun)', 'var(--coral)', 'var(--rose)', 'var(--sage)']

  const submit = () => {
    const value = Number.parseFloat(amount)
    if (!concept.trim() || !value || value <= 0) return
    addTransaction({
      concept: concept.trim(),
      amount: value,
      type,
      category,
      payer: scope === 'personal' ? 'tu' : payer,
      scope,
      date: todayISO(),
    })
    setConcept('')
    setAmount('')
    setOpen(false)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Finanzas en pareja"
        title="Vuestro dinero"
        subtitle="Transparencia que une, no que divide."
        gradient="from-sun via-coral to-rose"
        right={
          <img
            src={scope === 'compartida' ? '/finance-couple.png' : '/finance-personal.png'}
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[46%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      {/* Balance del mes */}
      <div className="mx-6 mt-5 rounded-3xl border border-border/60 bg-card p-4 shadow-lg shadow-violet/10">
        <p className="text-xs text-muted-foreground">Balance del mes</p>
        <p className="font-mono text-3xl font-bold">{hydrated ? eur(balance) : '—'}</p>
        <div className="mt-3 flex gap-3">
          <span className="flex items-center gap-1.5 rounded-xl bg-mint/15 px-3 py-1.5 text-sm font-medium text-mint">
            <ArrowUpRight className="h-4 w-4" /> {hydrated ? eur(income) : '—'}
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-coral/15 px-3 py-1.5 text-sm font-medium text-coral">
            <ArrowDownLeft className="h-4 w-4" /> {hydrated ? eur(expense) : '—'}
          </span>
        </div>
      </div>

      {/* Toggle Personal / Compartida */}
      <div className="col-full mx-6 mt-5 flex gap-1.5 rounded-2xl border border-border/60 bg-card p-1.5 shadow-lg shadow-violet/10">
        {(['personal', 'compartida'] as Scope[]).map((sc) => (
          <button
            key={sc}
            onClick={() => setScope(sc)}
            className={cn(
              'flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-colors',
              scope === sc ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            {sc === 'personal' ? 'Personal' : 'Compartida'}
          </button>
        ))}
      </div>

      {/* Presupuesto (según pestaña) */}
      <BudgetSection scope={scope} />

      {/* Distribución: plan vs real */}
      <DistributionChart scope={scope} />

      {/* Donut · gasto por categoría */}
      {hydrated && byCategory.length > 0 && (
        <div className="mx-6 mt-6 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
          <h2 className="mb-2 font-heading text-lg font-semibold">Gasto por categoría</h2>
          <div className="flex items-center gap-3">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="100%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={palette[i % palette.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold leading-none">{eur(expense)}</span>
                <span className="text-[10px] text-muted-foreground">gastado</span>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {byCategory.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: palette[i % palette.length] }}
                  />
                  <span className="flex-1 truncate text-foreground/80">{c.name}</span>
                  <span className="font-mono text-xs font-semibold">{eur(c.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Plan de ahorro */}
      <div className="mx-6 mt-6">
        <SavingsJar />
      </div>

      {/* Inversiones */}
      <Investments scope={scope} />

      {/* Junta financiera mensual */}
      <div className="mx-6 mt-6">
        <MonthlyMeeting />
      </div>

      {/* Transactions */}
      <section className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">
            Movimientos {scope === 'personal' ? 'personales' : 'compartidos'}
          </h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Añadir'}
          </button>
        </div>

        {open && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex gap-2">
              {(['gasto', 'ingreso'] as TxType[]).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors',
                    type === tp
                      ? tp === 'gasto'
                        ? 'border-coral bg-coral/10 text-coral'
                        : 'border-mint bg-mint/15 text-mint'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {tp}
                </button>
              ))}
            </div>
            <input
              autoFocus
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Concepto"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="0.00"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              >
                {categoryOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {scope === 'compartida' &&
                (['tu', 'pareja'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPayer(p)}
                    className={cn(
                      'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                      payer === p ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                    )}
                  >
                    {p === 'tu' ? 'Pagué yo' : 'Pagó pareja'}
                  </button>
                ))}
              <button
                onClick={submit}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2.5">
          {hydrated &&
            visible.map((t) => (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    t.type === 'ingreso' ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral',
                  )}
                >
                  {t.type === 'ingreso' ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.concept}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category}
                    {(t.scope ?? 'personal') === 'compartida' && ` · ${t.payer === 'tu' ? 'Pagué yo' : 'Pagó pareja'}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'font-mono text-sm font-semibold',
                    t.type === 'ingreso' ? 'text-mint' : 'text-foreground',
                  )}
                >
                  {t.type === 'ingreso' ? '+' : '−'}
                  {eur(t.amount)}
                </span>
                <button
                  onClick={() => removeTransaction(t.id)}
                  aria-label="Eliminar movimiento"
                  className="text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}
