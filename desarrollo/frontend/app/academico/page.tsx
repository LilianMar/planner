'use client'

import { useState } from 'react'
import { Plus, X, Trash2, BookMarked } from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis, type ResearchStatus } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const STATUS_TINT: Record<ResearchStatus, string> = {
  borrador: 'bg-muted text-muted-foreground',
  revision: 'bg-sun/20 text-sun',
  enviado: 'bg-violet/15 text-violet',
  publicado: 'bg-mint/15 text-mint',
}
const STATUS_LABEL: Record<ResearchStatus, string> = {
  borrador: 'Borrador',
  revision: 'Revisión',
  enviado: 'Enviado',
  publicado: 'Publicado',
}

export default function AcademicoPage() {
  const hydrated = useHydrated()
  const researches = useThemis((s) => s.researches)
  const addResearch = useThemis((s) => s.addResearch)
  const cycleResearchStatus = useThemis((s) => s.cycleResearchStatus)
  const removeResearch = useThemis((s) => s.removeResearch)
  const journal = useThemis((s) => s.journal)
  const addJournalEntry = useThemis((s) => s.addJournalEntry)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')

  const [jOpen, setJOpen] = useState(false)
  const [project, setProject] = useState('')
  const [field, setField] = useState('')
  const [notes, setNotes] = useState('')

  const submitResearch = () => {
    if (!title.trim()) return
    addResearch({ title: title.trim(), tag: tag.trim() || 'General', status: 'borrador' })
    setTitle('')
    setTag('')
    setOpen(false)
  }

  const submitEntry = () => {
    if (!project.trim()) return
    addJournalEntry({ project: project.trim(), field: field.trim() || '—', notes: notes.trim() })
    setProject('')
    setField('')
    setNotes('')
    setJOpen(false)
  }

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Investigación y docencia"
        title="Tu vida académica"
        subtitle="Tu trabajo, ordenado y a la vista."
        gradient="from-navy via-violet to-navy"
        right={
          <img
            src="/pngs/investigacion1.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-44 max-w-[50%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-48"
          />
        }
      />

      {/* Investigaciones */}
      <section className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Investigaciones</h2>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {open ? 'Cerrar' : 'Nueva'}
          </button>
        </div>

        {open && (
          <div className="mb-4 flex gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitResearch()}
              placeholder="Etiqueta"
              className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <button
              onClick={submitResearch}
              className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Ok
            </button>
          </div>
        )}

        <ul className="space-y-2.5">
          {hydrated &&
            researches.map((r) => (
              <li
                key={r.id}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.tag}</p>
                </div>
                <button
                  onClick={() => cycleResearchStatus(r.id)}
                  className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', STATUS_TINT[r.status])}
                >
                  {STATUS_LABEL[r.status]}
                </button>
                <button
                  onClick={() => removeResearch(r.id)}
                  aria-label="Eliminar"
                  className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">Toca el estado para avanzarlo.</p>
      </section>

      {/* Diario docente */}
      <section className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Diario docente</h2>
          <button
            onClick={() => setJOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-violet/30"
          >
            {jOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {jOpen ? 'Cerrar' : 'Entrada'}
          </button>
        </div>

        {jOpen && (
          <div className="mb-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex gap-2">
              <input
                autoFocus
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Proyecto / aula"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              />
              <input
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="Campo formativo"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del día…"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            />
            <button
              onClick={submitEntry}
              className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
            >
              Guardar entrada
            </button>
          </div>
        )}

        <div className="space-y-3">
          {hydrated &&
            journal.map((e) => (
              <div key={e.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <BookMarked className="h-4 w-4 text-navy" />
                    {e.project}
                  </p>
                  <span className="font-mono text-xs text-muted-foreground">{e.date}</span>
                </div>
                <p className="text-xs font-medium text-violet">{e.field}</p>
                {e.notes && <p className="mt-1 text-sm text-foreground/80">{e.notes}</p>}
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
