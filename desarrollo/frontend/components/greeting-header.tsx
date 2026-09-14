'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GreetingHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  /** Frase motivacional opcional, mostrada en cursiva bajo el subtítulo. */
  quote?: ReactNode
  /** tailwind gradient classes for the header surface */
  gradient?: string
  right?: ReactNode
  children?: ReactNode
}

export function GreetingHeader({
  eyebrow,
  title,
  subtitle,
  quote,
  gradient = 'from-violet to-mint',
  right,
  children,
}: GreetingHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-b-[2.25rem] bg-gradient-to-br px-6 pb-8 pt-12 text-primary-foreground',
        gradient,
      )}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/80">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-3xl font-bold leading-tight text-balance">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-white/85">{subtitle}</p>}
          {quote && (
            <p className="mt-2 text-sm italic leading-snug text-white/90 text-balance">
              “{quote}”
            </p>
          )}
        </div>
        {right}
      </div>

      {children && <div className="relative mt-5">{children}</div>}
    </header>
  )
}
