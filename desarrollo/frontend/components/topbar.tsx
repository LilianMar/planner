'use client'

import { Bell, Menu, Search, Settings } from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

/** Barra superior del dashboard · sólo escritorio (lg+). */
export function Topbar({ onMenu }: { onMenu: () => void }) {
  const hydrated = useHydrated()
  const name = useThemis((s) => s.userName)

  return (
    <header className="hidden shrink-0 items-center gap-4 border-b border-border/60 bg-card px-8 py-4 lg:flex">
      <button
        onClick={onMenu}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <p className="font-heading text-lg font-bold leading-tight">
          {greeting()}, {hydrated ? name : 'Jane'} 👋
        </p>
        <p className="text-xs text-muted-foreground">Bienvenida de vuelta a tu espacio.</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden xl:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar…"
            className="w-64 rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-violet"
          />
        </div>
        <button
          aria-label="Notificaciones"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          aria-label="Ajustes"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <Settings className="h-5 w-5" />
        </button>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose font-heading font-bold text-white">
          {(hydrated ? name : 'J').charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  )
}
