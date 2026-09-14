'use client'

import { useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { useThemis, type Priority } from '@/lib/store'
import { cn } from '@/lib/utils'

const priorityColor: Record<Priority, string> = {
  alta: 'bg-coral',
  media: 'bg-sun',
  baja: 'bg-sage',
}

const areas = ['Trabajo', 'Familia', 'Hogar', 'Bienestar', 'Finanzas']

export function TodayTasks() {
  const tasks = useThemis((s) => s.tasks)
  const toggleTask = useThemis((s) => s.toggleTask)
  const removeTask = useThemis((s) => s.removeTask)
  const addTask = useThemis((s) => s.addTask)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [area, setArea] = useState('Trabajo')

  const submit = () => {
    if (!title.trim()) return
    addTask({ title: title.trim(), time: time || undefined, priority, area })
    setTitle('')
    setTime('')
    setPriority('media')
    setOpen(false)
  }

  return (
    <section className="mt-7 px-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Mi Día</h2>
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
            placeholder="¿Qué necesitas hacer?"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
            />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-violet"
            >
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            {(['alta', 'media', 'baja'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  priority === p ? 'border-violet bg-violet/10 text-violet' : 'border-border text-muted-foreground',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', priorityColor[p])} />
                {p}
              </button>
            ))}
            <button
              onClick={submit}
              className="ml-auto rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2.5">
        {tasks.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            No hay tareas. Disfruta tu día o añade una nueva.
          </li>
        )}
        {tasks.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
          >
            <button
              onClick={() => toggleTask(t.id)}
              aria-label={t.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                t.done ? 'border-mint bg-mint text-card' : 'border-border',
              )}
            >
              {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-medium', t.done && 'text-muted-foreground line-through')}>
                {t.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {t.time && <span className="font-mono">{t.time}</span>}
                <span className="flex items-center gap-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', priorityColor[t.priority])} />
                  {t.area}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeTask(t.id)}
              aria-label="Eliminar tarea"
              className="text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
