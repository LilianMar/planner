'use client'

import { useState, type ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      {/* Menú lateral (hamburguesa) — sólo escritorio */}
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Escenario: móvil/tablet idénticos (celular) · panel completo en escritorio */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-lila/30 via-background to-mint/20 lg:block lg:bg-none lg:bg-muted/30 lg:p-0">
        <div className="relative flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-background shadow-2xl shadow-violet/20 md:max-w-none md:shadow-none lg:max-h-none">
          {/* Barra superior — sólo escritorio */}
          <Topbar onMenu={() => setNavOpen(true)} />

          {/* Contenido desplazable */}
          <div className="no-scrollbar flex-1 overflow-y-auto pb-2 lg:px-8 lg:py-8">
            <div className="lg:mx-auto lg:max-w-6xl">{children}</div>
          </div>

          {/* Navegación inferior — sólo móvil/tablet */}
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
