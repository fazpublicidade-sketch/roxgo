import { createContext, useContext } from 'react'

export type Athlete = {
  id: string
  name: string | null
  email: string | null
  next_race: string | null
  race_date: string | null
  category: string | null
  experience: string | null
  created_at: string
}

type AthleteContextValue = {
  athlete: Athlete | null
  refreshAthlete: () => Promise<void>
}

export const AthleteContext = createContext<AthleteContextValue>({
  athlete: null,
  refreshAthlete: async () => {},
})

export const useAthlete = () => useContext(AthleteContext)
