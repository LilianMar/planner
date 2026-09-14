'use client'

import { useState } from 'react'
import { Plus, X, Check, Trash2, Phone, Droplet, AlertCircle, Stethoscope, Sun, Moon } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const RELATIONS = ['Familia', 'Apoyo', 'Pediatra', 'Amigos']

const MORNING = ['Despertar y abrazo', 'Desayuno', 'Vestirse', 'Colegio']
const NIGHT = ['Cena', 'Baño', 'Cuento', 'A dormir']

export default function FamiliaPage() {
  const hydrated = useHydrated()
  const family = useThemis((s) => s.family)
  const contacts = useThemis((s) => s.contacts)
  const addContact = useThemis((s) => s.addContact)
  const removeContact = useThemis((s) => s.removeContact)
  const milestones = useThemis((s) => s.milestones)
  const addMilestone = useThemis((s) => s.addMilestone)
  const toggleMilestone = useThemis((s) => s.toggleMilestone)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('Familia')
  const [phone, setPhone] = useState('')

  const [msOpen, setMsOpen] = useState(false)
  const [msTitle, setMsTitle] = useState('')
  const [msDate, setMsDate] = useState('')

  const submitContact = () => {
    if (!name.trim()) return
    addContact({ name: name.trim(), relation, phone: phone.trim() })
    setName('')
    setPhone('')
    setOpen(false)
  }

  const submitMilestone = () => {
    if (!msTitle.trim()) return
    addMilestone({ title: msTitle.trim(), date: msDate })
    setMsTitle('')
    setMsDate('')
    setMsOpen(false)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Familia y mellizos"
        title="Tu tribu"
        subtitle="Todo lo de los peques, en un solo lugar."
        gradient="from-rose via-coral to-sun"
        right={
          <img
            src="/family-tribe.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[44%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      {/* Información médica */}
      <section className="px-6 pt-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Información médica</h2>
        <div className="space-y-3">
          {hydrated &&
            family.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-heading text-base font-semibold">{m.name}</p>
                  <span className="rounded-full bg-rose/15 px-2.5 py-1 text-[10px] font-medium text-rose">
                    {m.role}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-sm text-foreground/80">
                  <span className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-rose" /> Sangre: <b className="font-mono">{m.bloodType}</b>
                  </span>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-coral" /> Alergias: {m.allergies}
                  </span>
                  <span className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-sage" /> Médico: {m.doctor}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Rutinas */}
      <section className="px-6 pt-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Rutinas de los mellizos</h2>
        <div className="grid grid-cols-2 gap-3">
          <RoutineCard title="Mañana" icon={Sun} tint="bg-sun/15 text-sun" steps={MORNING} />
          <RoutineCard title="Noche" icon={Moon} tint="bg-violet/15 text-violet" steps={NIGHT} />
        </div>
      </section>

      {/* Hitos */}
      <section className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Hitos del desarrollo</h2>
          <button
            onClick={() => setMsOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {msOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {msOpen ? 'Cerrar' : 'Nuevo hito'}
          </button>
        </div>

        {msOpen && (
          <div className="mb-4 flex gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="¿Qué hito?"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <input
              type="date"
              value={msDate}
              onChange={(e) => setMsDate(e.target.value)}
              className="rounded-xl border border-border bg-background px-2 py-2 font-mono text-xs outline-none focus:border-violet"
            />
            <button
              onClick={submitMilestone}
              className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Ok
            </button>
          </div>
        )}

        <ul className="space-y-2.5">
          {hydrated &&
            milestones.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <button
                  onClick={() => toggleMilestone(m.id)}
                  aria-label={m.done ? 'Marcar pendiente' : 'Marcar logrado'}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    m.done ? 'border-mint bg-mint text-white' : 'border-border',
                  )}
                >
                  {m.done && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <p className={cn('flex-1 text-sm font-medium', m.done && 'text-muted-foreground')}>{m.title}</p>
                {m.date && <span className="font-mono text-xs text-muted-foreground">{m.date}</span>}
              </li>
            ))}
        </ul>
      </section>

      {/* Red de apoyo */}
      <section className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Red de apoyo</h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Contacto'}
          </button>
        </div>

        {open && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <div className="flex gap-2">
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              >
                {RELATIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitContact()}
                inputMode="tel"
                placeholder="Teléfono"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
              />
            </div>
            <button
              onClick={submitContact}
              className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
            >
              Guardar contacto
            </button>
          </div>
        )}

        <ul className="space-y-2.5">
          {hydrated &&
            contacts.map((c) => (
              <li
                key={c.id}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/20 text-sage">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relation}</p>
                </div>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="font-mono text-xs text-violet">
                  {c.phone}
                </a>
                <button
                  onClick={() => removeContact(c.id)}
                  aria-label="Eliminar contacto"
                  className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
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

function RoutineCard({
  title,
  icon: Icon,
  tint,
  steps,
}: {
  title: string
  icon: typeof Sun
  tint: string
  steps: string[]
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <span className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', tint)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-xs text-foreground/80">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted font-mono text-[9px]">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}
