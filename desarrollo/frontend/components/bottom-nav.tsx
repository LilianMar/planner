'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Repeat, CircleDashed, Wallet, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Mi Día', icon: Home },
  { href: '/habitos', label: 'Hábitos', icon: Repeat },
  { href: '/rueda', label: 'Rueda', icon: CircleDashed },
  { href: '/finanzas', label: 'Finanzas', icon: Wallet },
  { href: '/mas', label: 'Más', icon: LayoutGrid },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="shrink-0 px-3 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-center justify-around rounded-3xl border border-border/60 bg-card/90 px-2 py-2 shadow-lg shadow-violet/10 backdrop-blur-md">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-violet/30'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
