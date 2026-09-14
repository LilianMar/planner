'use client'

import { GreetingHeader } from '@/components/greeting-header'
import { WaterTracker } from '@/components/bienestar/water-tracker'
import { MoodTracker } from '@/components/bienestar/mood-tracker'
import { SleepTracker } from '@/components/bienestar/sleep-tracker'
import { FitnessTracker } from '@/components/bienestar/fitness-tracker'
import { MeasurementsTracker } from '@/components/bienestar/measurements-tracker'

export default function BienestarPage() {
  return (
    <div className="web-grid">
      <GreetingHeader
        eyebrow="Bienestar"
        title="Cuídate primero"
        subtitle="Desde ahí puedes dar lo mejor a todos."
        gradient="from-mint via-sage to-lila"
      />

      <WaterTracker />
      <MoodTracker />
      <SleepTracker />
      <FitnessTracker />
      <MeasurementsTracker />
    </div>
  )
}
