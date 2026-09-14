'use client'

import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/** Plan de ahorro · tarro SVG con nivel de agua animado (M05). */
export function SavingsJar() {
  const hydrated = useHydrated()
  const saved = useThemis((s) => s.saved)
  const goal = useThemis((s) => s.savingsGoal)
  const addToSavings = useThemis((s) => s.addToSavings)
  const setSavingsGoal = useThemis((s) => s.setSavingsGoal)

  const [amount, setAmount] = useState('')
  const [editGoal, setEditGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const pct = hydrated ? Math.min(100, Math.round((saved / goal) * 100)) : 0
  // Nivel de agua dentro del tarro (viewBox 0..100, tarro entre y=18 y y=92).
  const top = 18
  const bottom = 92
  const waterY = bottom - ((bottom - top) * pct) / 100

  const add = () => {
    const v = Number.parseFloat(amount)
    if (!v) return
    addToSavings(v)
    setAmount('')
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Plan de ahorro</h2>
        <button
          onClick={() => {
            setGoalInput(String(goal))
            setEditGoal((e) => !e)
          }}
          className="flex items-center gap-1 text-xs font-medium text-violet"
        >
          <Target className="h-3.5 w-3.5" /> Meta: {hydrated ? eur(goal) : '—'}
        </button>
      </div>

      {editGoal && (
        <div className="mb-3 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Nueva meta"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
          />
          <button
            onClick={() => {
              const v = Number.parseFloat(goalInput)
              if (v) setSavingsGoal(v)
              setEditGoal(false)
            }}
            className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Ok
          </button>
        </div>
      )}

      <div className="flex items-center gap-5">
        {/* Tarro SVG */}
        <svg viewBox="0 0 80 100" className="h-32 w-24 shrink-0" aria-hidden>
          <defs>
            <clipPath id="jar-clip">
              <path d="M18 18 H62 V86 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 Z" />
            </clipPath>
          </defs>
          {/* agua */}
          <rect
            x="18"
            y={waterY}
            width="44"
            height={bottom - waterY}
            fill="var(--mint)"
            clipPath="url(#jar-clip)"
            className="transition-all duration-700 ease-out"
          />
          <rect
            x="18"
            y={waterY}
            width="44"
            height="4"
            fill="var(--sage)"
            clipPath="url(#jar-clip)"
            className="transition-all duration-700 ease-out"
          />
          {/* contorno del tarro */}
          <path
            d="M18 18 H62 V86 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 Z"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2.5"
          />
          {/* tapa */}
          <rect x="22" y="9" width="36" height="9" rx="3" fill="var(--violet)" />
          <text
            x="40"
            y="62"
            textAnchor="middle"
            className="fill-foreground font-mono"
            fontSize="13"
            fontWeight="700"
          >
            {pct}%
          </text>
        </svg>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-2xl font-bold">{hydrated ? eur(saved) : '—'}</p>
          <p className="text-xs text-muted-foreground">
            de {hydrated ? eur(goal) : '—'} · faltan {hydrated ? eur(Math.max(0, goal - saved)) : '—'}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="+ aportar"
              className="w-24 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-violet"
            />
            <button
              onClick={add}
              aria-label="Aportar al ahorro"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
