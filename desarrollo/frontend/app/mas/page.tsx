'use client'

import Link from 'next/link'
import {
  CalendarDays,
  Home as HomeIcon,
  BrainCircuit,
  Users,
  GraduationCap,
  PartyPopper,
  CalendarHeart,
  HeartPulse,
  ChefHat,
  RotateCcw,
} from 'lucide-react'
import { GreetingHeader } from '@/components/greeting-header'
import { useThemis } from '@/lib/store'

const modules = [
  { href: '/planeador', label: 'Planeador', desc: 'Agenda y calendario semanal', icon: CalendarDays, color: 'bg-violet/15 text-violet' },
  { href: '/hogar', label: 'Centro de Mando del Hogar', desc: 'Tareas y mantenimiento del hogar', icon: HomeIcon, color: 'bg-mint/20 text-mint' },
  { href: '/descarga', label: 'Descarga Mental', desc: 'Vacía tu mente, reduce el ruido', icon: BrainCircuit, color: 'bg-rose/20 text-rose' },
  { href: '/bienestar', label: 'Bienestar', desc: 'Agua, ánimo, sueño y fitness', icon: HeartPulse, color: 'bg-mint/20 text-mint' },
  { href: '/recetas', label: 'Recetas', desc: 'Biblioteca de recetas y PDFs', icon: ChefHat, color: 'bg-coral/15 text-coral' },
  { href: '/ciclo', label: 'Ciclo Menstrual', desc: 'Fases, predicciones y síntomas', icon: CalendarHeart, color: 'bg-rose/15 text-rose' },
  { href: '/familia', label: 'Familia y Mellizos', desc: 'Rutinas y seguimiento infantil', icon: Users, color: 'bg-sun/25 text-coral' },
  { href: '/academico', label: 'Investigación y Docencia', desc: 'Proyectos académicos', icon: GraduationCap, color: 'bg-sage/20 text-sage' },
  { href: '/eventos', label: 'Eventos con IA', desc: 'Checklists generadas a medida', icon: PartyPopper, color: 'bg-lila/25 text-lila' },
]

export default function MasPage() {
  const resetAll = useThemis((s) => s.resetAll)

  return (
    <div className="lg:mx-auto lg:max-w-2xl">
      <GreetingHeader
        eyebrow="Explorar"
        title="Más módulos"
        subtitle="Todo Themis, en un solo lugar."
        gradient="from-navy via-violet to-lila"
        right={
          <img
            src="/pngs/podar.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-2 -mr-1 -mt-2 w-36 max-w-[46%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-40"
          />
        }
      />

      <section className="px-6 py-6">
        <h2 className="mb-4 font-heading text-xl font-semibold">Todos los módulos</h2>
        <div className="grid grid-cols-2 gap-3">
          {modules.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-violet/40"
            >
              <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <p className="text-sm font-semibold leading-tight">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>

        <button
          onClick={() => {
            if (confirm('¿Restablecer todos los datos de ejemplo?')) resetAll()
          }}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Restablecer datos de ejemplo
        </button>

        <p className="mt-6 text-center font-heading text-sm italic text-muted-foreground">
          Themis — Tu vida, en orden.
        </p>
      </section>
    </div>
  )
}
