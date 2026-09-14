'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const PROMPTS = ['Hoy me preocupa…', 'Hoy agradezco…', 'Necesito soltar…']
const CATEGORIES = ['Pendiente', 'Gratitud', 'Soltar', 'Idea']
const NOTE_COLORS = ['lila', 'sun', 'rose', 'mint', 'coral']
const NOTE_TINT: Record<string, string> = {
  lila: 'bg-lila/20 border-lila/30',
  sun: 'bg-sun/20 border-sun/30',
  rose: 'bg-rose/15 border-rose/30',
  mint: 'bg-mint/15 border-mint/30',
  coral: 'bg-coral/15 border-coral/30',
}

export default function DescargaPage() {
  const hydrated = useHydrated()
  const notes = useThemis((s) => s.notes)
  const addNote = useThemis((s) => s.addNote)
  const removeNote = useThemis((s) => s.removeNote)

  const [text, setText] = useState('')
  const [color, setColor] = useState('lila')
  const [category, setCategory] = useState('Pendiente')
  const [brainDump, setBrainDump] = useState('')

  const submit = () => {
    if (!text.trim()) return
    addNote({ text: text.trim(), color, category })
    setText('')
  }

  const dumpToNote = () => {
    if (!brainDump.trim()) return
    addNote({ text: brainDump.trim(), color: 'mint', category: 'Idea' })
    setBrainDump('')
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Descarga mental"
        title="Vacía tu mente"
        subtitle="Lo que sale de la cabeza, deja de pesar."
        gradient="from-lila via-violet to-rose"
        right={
          <img
            src="/mind-dump.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-8 -mr-1 w-28 max-w-[40%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-32"
          />
        }
      />

      {/* Prompts guiados */}
      <section className="px-6 pt-6">
        <h2 className="mb-3 font-heading text-lg font-semibold">Prompts de hoy</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setText(p + ' ')
                document.getElementById('note-input')?.focus()
              }}
              className="shrink-0 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-2 text-xs font-medium text-violet"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Nuevo post-it */}
      <section className="px-6 pt-5">
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <textarea
            id="note-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="¿Qué quieres soltar hoy?"
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
          />
          <div className="flex flex-wrap items-center gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                className={cn(
                  'h-6 w-6 rounded-full ring-offset-2 ring-offset-card transition-all',
                  `bg-${c}`,
                  color === c && 'ring-2 ring-foreground/40',
                )}
              />
            ))}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="ml-auto rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={submit}
              className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Añadir
            </button>
          </div>
        </div>
      </section>

      {/* Post-its */}
      <section className="px-6 pt-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Tus notas</h2>
        {hydrated && notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía nada aquí — ¡empieza hoy!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {hydrated &&
              notes.map((n) => (
                <div
                  key={n.id}
                  className={cn('group relative rounded-2xl border p-3 shadow-sm', NOTE_TINT[n.color] ?? NOTE_TINT.lila)}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide text-foreground/50">
                    {n.category}
                  </span>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{n.text}</p>
                  <button
                    onClick={() => removeNote(n.id)}
                    aria-label="Eliminar nota"
                    className="absolute right-2 top-2 text-foreground/30 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Vaciar mente */}
      <section className="px-6 py-6">
        <div className="rounded-3xl border border-border/60 bg-violet/5 p-5 shadow-sm">
          <h2 className="mb-2 font-heading text-lg font-semibold">Vaciar mente</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Escribe sin estructura, sin filtro. Suéltalo todo aquí.
          </p>
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Escribe libremente…"
            rows={5}
            className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-violet"
          />
          <button
            onClick={dumpToNote}
            className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Guardar como nota
          </button>
        </div>
      </section>
    </div>
  )
}
