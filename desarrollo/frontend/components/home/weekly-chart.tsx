'use client'

import { Line, LineChart, ResponsiveContainer, XAxis } from 'recharts'

const data = [
  { day: 'Lun', focus: 6, mood: 7 },
  { day: 'Mar', focus: 8, mood: 6 },
  { day: 'Mié', focus: 5, mood: 8 },
  { day: 'Jue', focus: 9, mood: 7 },
  { day: 'Vie', focus: 7, mood: 9 },
  { day: 'Sáb', focus: 4, mood: 8 },
  { day: 'Dom', focus: 6, mood: 9 },
]

export function WeeklyChart() {
  return (
    <section className="mt-7 px-6">
      <h2 className="mb-3 font-heading text-xl font-semibold">Tu semana</h2>
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet" /> Enfoque
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-mint" /> Ánimo
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="focus"
              stroke="var(--violet)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--mint)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
