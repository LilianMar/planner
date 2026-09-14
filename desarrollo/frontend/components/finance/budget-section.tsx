'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Trash2, Wallet, Users, HeartHandshake } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { BUDGET_TEMPLATES, actualForKind, spendingKind, BUDGET_COLOR } from '@/lib/budget'
import { cn } from '@/lib/utils'

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export function BudgetSection({ scope }: { scope: 'personal' | 'compartida' }) {
  return scope === 'personal' ? <PersonalBudget /> : <SharedBudget />
}

/* ---------------- Presupuesto personal ---------------- */

function PersonalBudget() {
  const hydrated = useHydrated()
  const mySalary = useThemis((s) => s.mySalary)
  const setMySalary = useThemis((s) => s.setMySalary)
  const mySharePct = useThemis((s) => s.mySharePct)
  const template = useThemis((s) => s.personalTemplate)
  const buckets = useThemis((s) => s.personalBuckets)
  const applyTemplate = useThemis((s) => s.applyPersonalTemplate)
  const setBucketPct = useThemis((s) => s.setPersonalBucketPct)
  const transactions = useThemis((s) => s.transactions)
  const investments = useThemis((s) => s.investments)

  const sharedContribution = (mySalary * mySharePct) / 100
  const disposable = mySalary - sharedContribution

  const actuals = useMemo(() => {
    let necesidades = 0
    let deseos = 0
    let totalSpent = 0
    for (const t of transactions) {
      if (t.type !== 'gasto' || t.payer !== 'tu') continue
      totalSpent += t.amount
      if (spendingKind(t.category) === 'necesidades') necesidades += t.amount
      else deseos += t.amount
    }
    const invested = investments.reduce((acc, i) => acc + i.amount, 0)
    return { necesidades, deseos, totalSpent, income: disposable, invested }
  }, [transactions, investments, disposable])

  const totalPct = buckets.reduce((acc, b) => acc + b.pct, 0)
  const activeTpl = BUDGET_TEMPLATES.find((t) => t.id === template)

  return (
    <section className="px-6 pt-6">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold">
        <Wallet className="h-5 w-5 text-coral" /> Presupuesto personal
      </h2>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        {/* Sueldo y aporte */}
        <div className="rounded-2xl bg-muted/50 p-4">
          <NumberRow label="Mi sueldo" value={mySalary} onChange={setMySalary} suffix="€" />
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HeartHandshake className="h-4 w-4 text-rose" /> Aporte a lo compartido ({mySharePct}%)
            </span>
            <span className="font-mono font-semibold text-rose">−{hydrated ? eur(sharedContribution) : '—'}</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-violet/10 px-3 py-2">
            <span className="text-sm font-medium text-violet">Disponible para mí</span>
            <span className="font-mono text-lg font-bold text-violet">{hydrated ? eur(disposable) : '—'}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            El % de aporte se ajusta en la pestaña <b>Compartida</b>.
          </p>
        </div>

        {/* Plantilla */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Plantilla</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {BUDGET_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
                  template === t.id ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
          {activeTpl && (
            <p className="mt-2 text-xs text-muted-foreground">
              {activeTpl.desc} <span className="text-muted-foreground/70">· {activeTpl.source}</span>
            </p>
          )}
        </div>

        {/* Buckets sobre el disponible */}
        <div className="space-y-3">
          {hydrated &&
            buckets.map((b) => {
              const target = (disposable * b.pct) / 100
              const actual = actualForKind(b.kind, actuals)
              const ratio = target > 0 ? Math.round((actual / target) * 100) : 0
              const over = actual > target && target > 0
              return (
                <BucketBar
                  key={b.id}
                  name={b.name}
                  color={b.color}
                  pct={b.pct}
                  target={target}
                  actual={actual}
                  ratio={ratio}
                  over={over}
                  onPct={(v) => setBucketPct(b.id, v)}
                />
              )
            })}
        </div>

        <TotalPct totalPct={totalPct} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <MiniStat label="Gastado" value={hydrated ? eur(actuals.totalSpent) : '—'} tint="text-coral" />
        <MiniStat
          label="Disponible"
          value={hydrated ? eur(disposable - actuals.totalSpent) : '—'}
          tint={disposable - actuals.totalSpent >= 0 ? 'text-mint' : 'text-coral'}
        />
        <MiniStat label="Aporte común" value={hydrated ? eur(sharedContribution) : '—'} tint="text-rose" />
      </div>
    </section>
  )
}

/* ---------------- Presupuesto compartido ---------------- */

function SharedBudget() {
  const hydrated = useHydrated()
  const mySalary = useThemis((s) => s.mySalary)
  const setMySalary = useThemis((s) => s.setMySalary)
  const mySharePct = useThemis((s) => s.mySharePct)
  const setMySharePct = useThemis((s) => s.setMySharePct)
  const partnerSalary = useThemis((s) => s.partnerSalary)
  const setPartnerSalary = useThemis((s) => s.setPartnerSalary)
  const partnerSharePct = useThemis((s) => s.partnerSharePct)
  const setPartnerSharePct = useThemis((s) => s.setPartnerSharePct)
  const buckets = useThemis((s) => s.sharedBuckets)
  const setBucketPct = useThemis((s) => s.setSharedBucketPct)
  const addBucket = useThemis((s) => s.addSharedBucket)
  const removeBucket = useThemis((s) => s.removeSharedBucket)

  const [newCat, setNewCat] = useState('')

  const myContribution = (mySalary * mySharePct) / 100
  const partnerContribution = (partnerSalary * partnerSharePct) / 100
  const pool = myContribution + partnerContribution
  const myShareOfPool = pool > 0 ? Math.round((myContribution / pool) * 100) : 0

  const totalPct = buckets.reduce((acc, b) => acc + b.pct, 0)

  return (
    <section className="px-6 pt-6">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold">
        <Users className="h-5 w-5 text-rose" /> Presupuesto compartido
      </h2>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        {/* Aportes */}
        <div className="space-y-3">
          <ContributionRow
            title="Tu aporte"
            salary={mySalary}
            pct={mySharePct}
            contribution={myContribution}
            onSalary={setMySalary}
            onPct={setMySharePct}
            hydrated={hydrated}
          />
          <ContributionRow
            title="Aporte de tu pareja"
            salary={partnerSalary}
            pct={partnerSharePct}
            contribution={partnerContribution}
            onSalary={setPartnerSalary}
            onPct={setPartnerSharePct}
            hydrated={hydrated}
          />
        </div>

        {/* Fondo común */}
        <div className="rounded-2xl bg-rose/10 p-4 text-center">
          <p className="text-xs text-muted-foreground">Fondo compartido del mes</p>
          <p className="font-mono text-3xl font-bold text-rose">{hydrated ? eur(pool) : '—'}</p>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-violet" style={{ width: `${myShareOfPool}%` }} />
            <div className="bg-coral" style={{ width: `${100 - myShareOfPool}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>Tú {hydrated ? myShareOfPool : 0}%</span>
            <span>Pareja {hydrated ? 100 - myShareOfPool : 0}%</span>
          </div>
        </div>

        {/* Desglose en categorías */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Desglose del fondo
          </p>
          <div className="space-y-3">
            {hydrated &&
              buckets.map((b) => (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="h-3 w-3 rounded-full" style={{ background: BUDGET_COLOR[b.color] }} />
                      {b.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold">{eur((pool * b.pct) / 100)}</span>
                      <button
                        onClick={() => removeBucket(b.id)}
                        aria-label={`Eliminar ${b.name}`}
                        className="text-muted-foreground/40 hover:text-coral"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={b.pct}
                      onChange={(e) => setBucketPct(b.id, Number(e.target.value))}
                      aria-label={`Porcentaje de ${b.name}`}
                      className="flex-1 accent-rose"
                    />
                    <span className="w-10 text-right font-mono text-xs font-semibold">{b.pct}%</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Añadir categoría */}
          <div className="mt-3 flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCat.trim()) {
                  addBucket(newCat.trim())
                  setNewCat('')
                }
              }}
              placeholder="Nueva categoría (ej: Transporte)"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <button
              onClick={() => {
                if (!newCat.trim()) return
                addBucket(newCat.trim())
                setNewCat('')
              }}
              aria-label="Añadir categoría"
              className="flex w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <TotalPct totalPct={totalPct} />
      </div>
    </section>
  )
}

/* ---------------- Subcomponentes ---------------- */

function ContributionRow({
  title,
  salary,
  pct,
  contribution,
  onSalary,
  onPct,
  hydrated,
}: {
  title: string
  salary: number
  pct: number
  contribution: number
  onSalary: (n: number) => void
  onPct: (n: number) => void
  hydrated: boolean
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <span className="font-mono text-sm font-bold text-rose">{hydrated ? eur(contribution) : '—'}</span>
      </div>
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5">
          <span className="text-[11px] text-muted-foreground">Sueldo</span>
          <input
            type="number"
            inputMode="numeric"
            value={salary}
            onChange={(e) => onSalary(Number(e.target.value))}
            className="w-full bg-transparent text-right font-mono text-sm outline-none"
          />
        </label>
        <label className="flex w-24 items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5">
          <input
            type="number"
            inputMode="numeric"
            value={pct}
            onChange={(e) => onPct(Number(e.target.value))}
            className="w-full bg-transparent text-right font-mono text-sm outline-none"
          />
          <span className="text-[11px] text-muted-foreground">%</span>
        </label>
      </div>
    </div>
  )
}

function NumberRow({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix?: string
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 bg-transparent text-right font-mono text-lg font-bold outline-none"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </span>
    </label>
  )
}

function BucketBar({
  name,
  color,
  pct,
  target,
  actual,
  ratio,
  over,
  onPct,
}: {
  name: string
  color: string
  pct: number
  target: number
  actual: number
  ratio: number
  over: boolean
  onPct: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="h-3 w-3 rounded-full" style={{ background: BUDGET_COLOR[color] }} />
          {name}
        </span>
        <span className="font-mono text-xs">
          <span className={cn(over && 'font-semibold text-coral')}>{eur(actual)}</span>
          <span className="text-muted-foreground"> / {eur(target)}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, ratio)}%`, background: over ? 'var(--coral)' : BUDGET_COLOR[color] }}
        />
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onPct(Number(e.target.value))}
          aria-label={`Porcentaje de ${name}`}
          className="flex-1 accent-violet"
        />
        <span className="w-10 text-right font-mono text-xs font-semibold">{pct}%</span>
      </div>
    </div>
  )
}

function TotalPct({ totalPct }: { totalPct: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs">
      <span className="text-muted-foreground">Total asignado</span>
      <span className={cn('font-mono font-semibold', totalPct === 100 ? 'text-mint' : 'text-coral')}>
        {totalPct}% {totalPct !== 100 && `(${totalPct > 100 ? 'te pasas' : 'sin asignar'})`}
      </span>
    </div>
  )
}

function MiniStat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3 text-center shadow-sm">
      <p className={cn('font-mono text-sm font-bold', tint)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
