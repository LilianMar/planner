'use client'

import { GreetingHeader } from '@/components/greeting-header'
import { DayProgress } from '@/components/home/day-progress'
import { QuickStats } from '@/components/home/quick-stats'
import { QuickActions } from '@/components/home/quick-actions'
import { TodayIntentions } from '@/components/home/today-intentions'
import { TodayTasks } from '@/components/home/today-tasks'
import { WeeklyChart } from '@/components/home/weekly-chart'
import { randomPhrase } from '@/lib/phrases'
import { useThemis } from '@/lib/store'
import { useHydrated } from '@/lib/use-hydrated'
import { useEffect, useState } from 'react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

const today = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function MiDiaPage() {
  const hydrated = useHydrated()
  const [phrase, setPhrase] = useState<string | null>(null)
  // Nueva frase motivacional en cada ingreso a la app (se elige en el cliente).
  useEffect(() => setPhrase(randomPhrase()), [])
  const name = useThemis((s) => s.userName)
  const tasks = useThemis((s) => s.tasks)
  const done = tasks.filter((t) => t.done).length

  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow={today}
        title={
          <>
            {greeting()},
            <br />
            {hydrated ? name : 'Jane'}.
          </>
        }
        quote={phrase}
        gradient="from-lila via-violet to-rose"
        right={
          <img
            src="/hero-girl.png"
            alt=""
            aria-hidden
            className="pointer-events-none -mb-8 -mr-1 w-28 max-w-[36%] shrink-0 select-none self-end object-contain drop-shadow-md sm:w-32"
          />
        }
      />

      <DayProgress done={hydrated ? done : 0} total={hydrated ? tasks.length : 4} />
      <QuickStats />
      <QuickActions />
      <TodayIntentions />
      {hydrated ? <TodayTasks /> : null}
      <WeeklyChart />
    </div>
  )
}
