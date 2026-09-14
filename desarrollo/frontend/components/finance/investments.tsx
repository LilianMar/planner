'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useThemis, type FinScope } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const TYPES = ['Acciones', 'Fondos', 'Cripto', 'Inmobiliario', 'Pensiones', 'Otro']
const TYPE_COLOR: Record<string, string> = {
  Acciones: 'var(--violet)',
  Fondos: 'var(--mint)',
  Cripto: 'var(--sun)',
  Inmobiliario: 'var(--coral)',
  Pensiones: 'var(--sage)',
  Otro: 'var(--lila)',
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export function Investments({ scope }: { scope: FinScope }) {
  const hydrated = useHydrated()
  const allInvestments = useThemis((s) => s.investments)
  const addInvestment = useThemis((s) => s.addInvestment)
  const removeInvestment = useThemis((s) => s.removeInvestment)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('Fondos')
  const [amount, setAmount] = useState('')
  const [value, setValue] = useState('')

  const investments = useMemo(
    () => allInvestments.filter((i) => (i.scope ?? 'personal') === scope),
    [allInvestments, scope],
  )

  const { invested, current, byType } = useMemo(() => {
    let invested = 0
    let current = 0
    const map: Record<string, number> = {}
    for (const i of investments) {
      invested += i.amount
      current += i.value
      map[i.type] = (map[i.type] ?? 0) + i.value
    }
    const byType = Object.entries(map).map(([name, value]) => ({ name, value }))
    return { invested, current, byType }
  }, [investments])

  const gain = current - invested
  const gainPct = invested > 0 ? Math.round((gain / invested) * 1000) / 10 : 0

  const submit = () => {
    const a = Number.parseFloat(amount)
    if (!name.trim() || !a) return
    const v = Number.parseFloat(value)
    addInvestment({ name: name.trim(), type, amount: a, value: Number.isNaN(v) ? a : v, scope })
    setName('')
    setAmount('')
    setValue('')
    setOpen(false)
  }

  return (
    <section className="px-6 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
          <TrendingUp className="h-5 w-5 text-violet" /> Inversiones {scope === 'personal' ? 'personales' : 'compartidas'}
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
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej: Fondo indexado)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Invertido €"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
            />
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Valor actual €"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
            />
          </div>
          <button
            onClick={submit}
            className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
          >
            Guardar inversión
          </button>
        </div>
      )}

      {hydrated && investments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
          Aún no registras inversiones. ¡Empieza a hacer crecer tu dinero!
        </p>
      ) : (
        <>
          {/* Resumen + distribución */}
          <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byType} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="100%" paddingAngle={2} stroke="none">
                      {byType.map((d) => (
                        <Cell key={d.name} fill={TYPE_COLOR[d.name] ?? 'var(--muted-foreground)'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-base font-bold leading-none">{hydrated ? eur(current) : '—'}</span>
                  <span className="text-[10px] text-muted-foreground">valor</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Invertido: <span className="font-mono text-foreground">{eur(invested)}</span></p>
                <p
                  className={cn(
                    'flex items-center gap-1 font-mono text-sm font-bold',
                    gain >= 0 ? 'text-mint' : 'text-coral',
                  )}
                >
                  {gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {gain >= 0 ? '+' : ''}{eur(gain)} ({gainPct}%)
                </p>
                <ul className="mt-1 space-y-1">
                  {byType.map((d) => (
                    <li key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TYPE_COLOR[d.name] }} />
                      <span className="flex-1 truncate text-foreground/80">{d.name}</span>
                      <span className="font-mono text-muted-foreground">{eur(d.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Lista de inversiones */}
          <ul className="mt-3 space-y-2.5">
            {hydrated &&
              investments.map((i) => {
                const g = i.value - i.amount
                return (
                  <li
                    key={i.id}
                    className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                      style={{ background: TYPE_COLOR[i.type] ?? 'var(--muted-foreground)' }}
                    >
                      {i.type.slice(0, 3)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.type} · {eur(i.amount)} invertido</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold">{eur(i.value)}</p>
                      <p className={cn('font-mono text-[10px]', g >= 0 ? 'text-mint' : 'text-coral')}>
                        {g >= 0 ? '+' : ''}{eur(g)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeInvestment(i.id)}
                      aria-label="Eliminar inversión"
                      className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
          </ul>
        </>
      )}
    </section>
  )
}
