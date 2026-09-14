'use client'

import { useMemo } from 'react'
import { PieChart as PieIcon, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useThemis, type FinScope } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { actualForKind, spendingKind, BUDGET_COLOR } from '@/lib/budget'
import { cn } from '@/lib/utils'

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

interface Row {
  name: string
  color: string
  plan: number
  real: number
  over: boolean
  saving: boolean
}

export function DistributionChart({ scope }: { scope: FinScope }) {
  const hydrated = useHydrated()
  const mySalary = useThemis((s) => s.mySalary)
  const mySharePct = useThemis((s) => s.mySharePct)
  const partnerSalary = useThemis((s) => s.partnerSalary)
  const partnerSharePct = useThemis((s) => s.partnerSharePct)
  const personalBuckets = useThemis((s) => s.personalBuckets)
  const sharedBuckets = useThemis((s) => s.sharedBuckets)
  const transactions = useThemis((s) => s.transactions)
  const investments = useThemis((s) => s.investments)

  const rows = useMemo<Row[]>(() => {
    if (scope === 'personal') {
      const disposable = mySalary - (mySalary * mySharePct) / 100
      let necesidades = 0
      let deseos = 0
      let totalSpent = 0
      for (const t of transactions) {
        if (t.type !== 'gasto' || (t.scope ?? 'personal') !== 'personal') continue
        totalSpent += t.amount
        if (spendingKind(t.category) === 'necesidades') necesidades += t.amount
        else deseos += t.amount
      }
      const invested = investments
        .filter((i) => (i.scope ?? 'personal') === 'personal')
        .reduce((acc, i) => acc + i.amount, 0)
      const actuals = { necesidades, deseos, totalSpent, income: disposable, invested }
      return personalBuckets.map((b) => {
        const plan = (disposable * b.pct) / 100
        const real = actualForKind(b.kind, actuals)
        const saving = b.kind === 'ahorro' || b.kind === 'inversion'
        return { name: b.name, color: b.color, plan, real, over: !saving && real > plan && plan > 0, saving }
      })
    }
    // compartida
    const pool =
      (mySalary * mySharePct) / 100 + (partnerSalary * partnerSharePct) / 100
    const byCat: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'gasto' || (t.scope ?? 'personal') !== 'compartida') continue
      byCat[t.category] = (byCat[t.category] ?? 0) + t.amount
    }
    return sharedBuckets.map((b) => {
      const plan = (pool * b.pct) / 100
      const real = byCat[b.name] ?? 0
      const saving = /ahorro/i.test(b.name)
      return { name: b.name, color: b.color, plan, real, over: !saving && real > plan && plan > 0, saving }
    })
  }, [scope, mySalary, mySharePct, partnerSalary, partnerSharePct, personalBuckets, sharedBuckets, transactions, investments])

  const totalPlan = rows.reduce((a, r) => a + (r.saving ? 0 : r.plan), 0)
  const totalReal = rows.reduce((a, r) => a + (r.saving ? 0 : r.real), 0)
  const overspent = rows.filter((r) => r.over)
  const healthy = overspent.length === 0 && totalReal <= totalPlan

  const data = rows.map((r) => ({ name: r.name.length > 11 ? r.name.slice(0, 10) + '…' : r.name, plan: Math.round(r.plan), real: Math.round(r.real), over: r.over, color: r.color }))

  return (
    <section className="px-6 pt-6">
      <h2 className="mb-3 flex items-center gap-2 font-heading text-xl font-semibold">
        <PieIcon className="h-5 w-5 text-violet" /> Distribución del mes
      </h2>

      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        {/* Leyenda */}
        <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" /> Presupuesto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet" /> Real
          </span>
        </div>

        {hydrated && (
          <ResponsiveContainer width="100%" height={rows.length * 54 + 10}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              barGap={2}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={78}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              />
              <Bar dataKey="plan" radius={[0, 4, 4, 0]} fill="var(--muted)" barSize={9} />
              <Bar dataKey="real" radius={[0, 4, 4, 0]} barSize={9}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.over ? 'var(--coral)' : BUDGET_COLOR[d.color] ?? 'var(--violet)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Salud del presupuesto */}
        <div
          className={cn(
            'mt-2 flex items-start gap-2 rounded-2xl p-3 text-sm',
            healthy ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral',
          )}
        >
          {healthy ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="text-foreground/80">
            {healthy ? (
              <>
                <b className="text-mint">Vas bien.</b> Tus gastos están dentro del plan
                {hydrated && <> ({eur(totalReal)} de {eur(totalPlan)}).</>}
              </>
            ) : (
              <>
                <b className="text-coral">Revisa: </b>
                {overspent.length > 0
                  ? `te pasaste en ${overspent.map((r) => r.name).join(', ')}.`
                  : `gastaste ${eur(totalReal)} de ${eur(totalPlan)} presupuestados.`}{' '}
                Quizá conviene ajustar.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
