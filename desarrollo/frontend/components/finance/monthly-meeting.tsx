'use client'

import { useState } from 'react'
import { ChevronDown, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  '¿Cumplimos el presupuesto del mes?',
  '¿Hubo algún gasto inesperado que revisar juntos?',
  '¿Avanzamos en nuestra meta de ahorro?',
  '¿Hay alguna deuda o pago próximo a planificar?',
  '¿Qué ajustamos para el mes que viene?',
]

/** Junta financiera mensual guiada · 5 preguntas para la pareja (M05). */
export function MonthlyMeeting() {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState<boolean[]>(Array(QUESTIONS.length).fill(false))

  const done = checked.filter(Boolean).length

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose/15 text-rose">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold">Junta financiera mensual</p>
          <p className="text-xs text-muted-foreground">{done}/{QUESTIONS.length} puntos revisados</p>
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul className="space-y-2 border-t border-border/60 p-4">
          {QUESTIONS.map((q, i) => (
            <li key={q}>
              <button
                onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    checked[i] ? 'border-mint bg-mint text-white' : 'border-border',
                  )}
                >
                  {checked[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={cn('text-sm', checked[i] && 'text-muted-foreground line-through')}>{q}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
