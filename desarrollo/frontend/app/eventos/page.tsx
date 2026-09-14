'use client'

import { useMemo, useState } from 'react'
import { Plus, Check, Trash2, Sparkles, Loader2, ChevronDown, Users } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type GuestStatus, type ThemisEvent } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { generateChecklist } from '@/lib/event-ai'
import { cn } from '@/lib/utils'

const GUEST_TINT: Record<GuestStatus, string> = {
  si: 'bg-mint/15 text-mint',
  no: 'bg-coral/15 text-coral',
  pendiente: 'bg-muted text-muted-foreground',
}
const GUEST_LABEL: Record<GuestStatus, string> = { si: 'Sí', no: 'No', pendiente: 'Pendiente' }

export default function EventosPage() {
  const hydrated = useHydrated()
  const events = useThemis((s) => s.events)
  const addEvent = useThemis((s) => s.addEvent)
  const removeEvent = useThemis((s) => s.removeEvent)

  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const generate = async () => {
    if (!desc.trim() || loading) return
    setLoading(true)
    const result = await generateChecklist(desc)
    const id = addEvent(result.name, result.items)
    setLoading(false)
    setDesc('')
    setOpenId(id)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Eventos con IA"
        title="Organiza sin estrés"
        subtitle="Describe tu evento y deja que la IA lo ordene."
        gradient="from-coral via-rose to-lila"
        right={
          <img
            src="/events-mgmt.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-44 max-w-[50%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-48"
          />
        }
      />

      {/* Generador IA */}
      <section className="px-6 pt-6">
        <div className="space-y-3 rounded-3xl border border-border/60 bg-card p-4 shadow-lg shadow-violet/10">
          <label className="text-sm font-medium">¿Qué quieres organizar?</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ej: Cumpleaños de los mellizos en casa para 15 niños…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-violet"
          />
          <button
            onClick={generate}
            disabled={loading || !desc.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generando checklist…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generar con IA
              </>
            )}
          </button>
        </div>
      </section>

      {/* Eventos */}
      <section className="px-6 py-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Tus eventos</h2>
        {hydrated && events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía nada aquí — describe tu primer evento arriba.
          </p>
        ) : (
          <div className="space-y-3">
            {hydrated &&
              events.map((ev) => (
                <EventCard
                  key={ev.id}
                  ev={ev}
                  open={openId === ev.id}
                  onToggleOpen={() => setOpenId((id) => (id === ev.id ? null : ev.id))}
                  onRemove={() => removeEvent(ev.id)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EventCard({
  ev,
  open,
  onToggleOpen,
  onRemove,
}: {
  ev: ThemisEvent
  open: boolean
  onToggleOpen: () => void
  onRemove: () => void
}) {
  const toggleEventItem = useThemis((s) => s.toggleEventItem)
  const addEventItem = useThemis((s) => s.addEventItem)
  const removeEventItem = useThemis((s) => s.removeEventItem)
  const addGuest = useThemis((s) => s.addGuest)
  const cycleGuestStatus = useThemis((s) => s.cycleGuestStatus)

  const [newItem, setNewItem] = useState('')
  const [newGuest, setNewGuest] = useState('')

  const doneCount = ev.items.filter((i) => i.done).length
  const confirmed = ev.guests.filter((g) => g.status === 'si').length

  const grouped = useMemo(() => {
    const map: Record<string, typeof ev.items> = {}
    for (const it of ev.items) (map[it.category] ??= []).push(it)
    return Object.entries(map)
  }, [ev.items])

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <button onClick={onToggleOpen} className="flex w-full items-center gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold">{ev.name}</p>
          <p className="text-xs text-muted-foreground">
            {doneCount}/{ev.items.length} listo · {confirmed} confirmados
          </p>
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/60 p-4">
          {/* Checklist por categoría */}
          {grouped.map(([category, items]) => (
            <div key={category}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet">{category}</p>
              <ul className="space-y-1.5">
                {items.map((it) => (
                  <li key={it.id} className="group flex items-center gap-2.5">
                    <button
                      onClick={() => toggleEventItem(ev.id, it.id)}
                      aria-label={it.done ? 'Marcar pendiente' : 'Marcar hecho'}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        it.done ? 'border-mint bg-mint text-white' : 'border-border',
                      )}
                    >
                      {it.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <span className={cn('flex-1 text-sm', it.done && 'text-muted-foreground line-through')}>
                      {it.text}
                    </span>
                    <button
                      onClick={() => removeEventItem(ev.id, it.id)}
                      aria-label="Eliminar ítem"
                      className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Añadir ítem */}
          <div className="flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  addEventItem(ev.id, newItem.trim(), 'Otros')
                  setNewItem('')
                }
              }}
              placeholder="Añadir ítem…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <button
              onClick={() => {
                if (!newItem.trim()) return
                addEventItem(ev.id, newItem.trim(), 'Otros')
                setNewItem('')
              }}
              aria-label="Añadir ítem"
              className="flex w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Invitados */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Users className="h-4 w-4 text-rose" /> Invitados ({confirmed}/{ev.guests.length})
            </p>
            <ul className="space-y-1.5">
              {ev.guests.map((g) => (
                <li key={g.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{g.name}</span>
                  <button
                    onClick={() => cycleGuestStatus(ev.id, g.id)}
                    className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', GUEST_TINT[g.status])}
                  >
                    {GUEST_LABEL[g.status]}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGuest.trim()) {
                    addGuest(ev.id, newGuest.trim())
                    setNewGuest('')
                  }
                }}
                placeholder="Añadir invitado…"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              />
              <button
                onClick={() => {
                  if (!newGuest.trim()) return
                  addGuest(ev.id, newGuest.trim())
                  setNewGuest('')
                }}
                aria-label="Añadir invitado"
                className="flex w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" /> Eliminar evento
          </button>
        </div>
      )}
    </div>
  )
}
