'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CalendarDays,
  Repeat,
  House,
  Wallet,
  CircleDashed,
  CalendarHeart,
  HeartPulse,
  ChefHat,
  BrainCircuit,
  Users,
  GraduationCap,
  PartyPopper,
  LogOut,
  X,
} from 'lucide-react'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/planeador', label: 'Planeador', icon: CalendarDays },
  { href: '/habitos', label: 'Hábitos', icon: Repeat },
  { href: '/hogar', label: 'Hogar', icon: House },
  { href: '/finanzas', label: 'Finanzas', icon: Wallet },
  { href: '/rueda', label: 'Rueda', icon: CircleDashed },
  { href: '/bienestar', label: 'Bienestar', icon: HeartPulse },
  { href: '/recetas', label: 'Recetas', icon: ChefHat },
  { href: '/ciclo', label: 'Ciclo', icon: CalendarHeart },
  { href: '/descarga', label: 'Descarga', icon: BrainCircuit },
  { href: '/familia', label: 'Familia', icon: Users },
  { href: '/academico', label: 'Académico', icon: GraduationCap },
  { href: '/eventos', label: 'Eventos', icon: PartyPopper },
]

/** Menú lateral tipo drawer (hamburguesa) · sólo escritorio (lg+). */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const name = useThemis((s) => s.userName)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden
          className="fixed inset-0 z-40 hidden bg-foreground/30 backdrop-blur-sm lg:block"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 hidden h-dvh w-64 flex-col border-r border-border/60 bg-card shadow-2xl shadow-violet/20 transition-transform duration-300 lg:flex',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo + cerrar */}
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-rose text-xl shadow-sm shadow-violet/30">
            ⚖️
          </span>
          <span className="font-heading text-xl font-bold">Themis</span>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-violet/30'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Usuaria */}
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose font-heading text-sm font-bold text-white">
            {(hydrated ? name : 'J').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{hydrated ? name : 'Jane'}</p>
            <p className="text-xs text-muted-foreground">Tu espacio</p>
          </div>
          <button aria-label="Salir" className="text-muted-foreground/60 hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  )
}
