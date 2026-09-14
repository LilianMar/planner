'use client'

import { useMemo, useState } from 'react'
import { Plus, X, Check, Trash2, Minus, AlertTriangle, Heart } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type Freq } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const ZONES = ['Cocina', 'Baño', 'Sala', 'Habitaciones', 'Exterior']
const FREQS: Freq[] = ['diaria', 'semanal', 'mensual']
const FREQ_TINT: Record<Freq, string> = {
  diaria: 'bg-mint/15 text-mint',
  semanal: 'bg-violet/15 text-violet',
  mensual: 'bg-coral/15 text-coral',
}

const VALUES = ['Respeto', 'Apoyo mutuo', 'Tiempo en familia', 'Honestidad']

export default function HogarPage() {
  const hydrated = useHydrated()
  const chores = useThemis((s) => s.chores)
  const addChore = useThemis((s) => s.addChore)
  const toggleChore = useThemis((s) => s.toggleChore)
  const removeChore = useThemis((s) => s.removeChore)
  const inventory = useThemis((s) => s.inventory)
  const setInventoryQty = useThemis((s) => s.setInventoryQty)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [zone, setZone] = useState('Cocina')
  const [freq, setFreq] = useState<Freq>('semanal')
  const [assignee, setAssignee] = useState<'tu' | 'pareja'>('tu')

  const { mine, partner } = useMemo(() => {
    const mine = chores.filter((c) => c.assignee === 'tu').length
    const partner = chores.filter((c) => c.assignee === 'pareja').length
    return { mine, partner }
  }, [chores])
  const total = mine + partner || 1
  const minePct = Math.round((mine / total) * 100)

  const submit = () => {
    if (!title.trim()) return
    addChore({ title: title.trim(), zone, freq, assignee })
    setTitle('')
    setOpen(false)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Centro de mando"
        title="Vuestro hogar"
        subtitle="Un equipo que se reparte la carga."
        gradient="from-mint via-sage to-mint"
        right={
          <img
            src="/pngs/gestion_hogar2.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[46%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      {/* Reparto de responsabilidades */}
      <div className="mx-6 mt-5 rounded-3xl border border-border/60 bg-card p-4 shadow-lg shadow-violet/10">
        <h2 className="mb-3 font-heading text-lg font-semibold">Reparto de la carga</h2>
        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
          <div className="bg-violet" style={{ width: `${minePct}%` }} />
          <div className="bg-mint" style={{ width: `${100 - minePct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet" /> Tú · {hydrated ? minePct : 0}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-mint" /> Pareja · {hydrated ? 100 - minePct : 0}%
          </span>
        </div>
      </div>

      {/* Limpieza / tareas */}
      <section className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Limpieza</h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Nueva tarea'}
          </button>
        </div>

        {open && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="¿Qué tarea del hogar?"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex gap-2">
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              >
                {ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as Freq)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize outline-none focus:border-violet"
              >
                {FREQS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {(['tu', 'pareja'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAssignee(p)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-medium transition-colors',
                    assignee === p ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                  )}
                >
                  {p === 'tu' ? 'Tú' : 'Pareja'}
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
            chores.map((c) => (
              <li
                key={c.id}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <button
                  onClick={() => toggleChore(c.id)}
                  aria-label={c.done ? 'Marcar pendiente' : 'Marcar hecha'}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    c.done ? 'border-mint bg-mint text-white' : 'border-border',
                  )}
                >
                  {c.done && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', c.done && 'text-muted-foreground line-through')}>
                    {c.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.zone} · {c.assignee === 'tu' ? 'Tú' : 'Pareja'}
                  </p>
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-medium capitalize', FREQ_TINT[c.freq])}>
                  {c.freq}
                </span>
                <button
                  onClick={() => removeChore(c.id)}
                  aria-label="Eliminar"
                  className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      </section>

      {/* Inventario */}
      <section className="px-6 pt-2">
        <h2 className="mb-4 font-heading text-xl font-semibold">Inventario</h2>
        <div className="grid grid-cols-2 gap-3">
          {hydrated &&
            inventory.map((it) => {
              const low = it.qty <= it.threshold
              return (
                <div key={it.id} className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{it.name}</p>
                    {low && <AlertTriangle className="h-4 w-4 shrink-0 text-coral" />}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => setInventoryQty(it.id, it.qty - 1)}
                      aria-label="Restar"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className={cn('font-mono text-lg font-bold', low && 'text-coral')}>{it.qty}</span>
                    <button
                      onClick={() => setInventoryQty(it.id, it.qty + 1)}
                      aria-label="Sumar"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {low && <p className="mt-1.5 text-[10px] font-medium text-coral">Reponer pronto</p>}
                </div>
              )
            })}
        </div>
      </section>

      {/* Contrato familiar */}
      <section className="px-6 py-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Contrato familiar</h2>
        <div className="rounded-3xl border border-border/60 bg-rose/10 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose/20 text-rose">
            <Heart className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm text-foreground/80">Nuestros valores no negociables:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VALUES.map((v) => (
              <span key={v} className="rounded-full bg-card px-3 py-1 text-xs font-medium shadow-sm">
                {v}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-around border-t border-rose/20 pt-3 text-center">
            <div>
              <p className="text-2xl">🙋‍♀️</p>
              <p className="text-xs text-muted-foreground">Tú</p>
            </div>
            <div>
              <p className="text-2xl">🙋‍♂️</p>
              <p className="text-xs text-muted-foreground">Pareja</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
