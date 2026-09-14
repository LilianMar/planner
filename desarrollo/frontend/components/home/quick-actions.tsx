'use client'

import Link from 'next/link'
import { Repeat, CircleDashed, Wallet, BrainCircuit } from 'lucide-react'

const actions = [
  { href: '/habitos', label: 'Hábitos', icon: Repeat, color: 'bg-mint/20 text-mint' },
  { href: '/rueda', label: 'Rueda', icon: CircleDashed, color: 'bg-violet/15 text-violet' },
  { href: '/finanzas', label: 'Finanzas', icon: Wallet, color: 'bg-sun/25 text-coral' },
  { href: '/mas', label: 'Descarga', icon: BrainCircuit, color: 'bg-rose/20 text-rose' },
]

export function QuickActions() {
  return (
    <div className="mt-6 grid grid-cols-4 gap-3 px-6">
      {actions.map(({ href, label, icon: Icon, color }) => (
        <Link key={href} href={href} className="flex flex-col items-center gap-2">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
            <Icon className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </Link>
      ))}
    </div>
  )
}
