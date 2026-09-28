import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from './supabase'
import { listRaces, listWorkouts, Race, Workout } from './data'

type State<T> = { data: T; loading: boolean; error: string | null; missingTable: boolean }

// Recarrega sempre que a tela ganha foco (ex: ao voltar de um treino gravado)
function useFocusQuery<T>(load: () => Promise<{ data: T; error: string | null; missingTable: boolean }>, initial: T, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ data: initial, loading: true, error: null, missingTable: false })

  useFocusEffect(
    useCallback(() => {
      let active = true
      load().then((result) => {
        if (active) setState({ ...result, loading: false })
      })
      return () => {
        active = false
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  )

  return state
}

export function useRaces(athleteId: string | undefined) {
  return useFocusQuery<Race[]>(
    () => athleteId ? listRaces(athleteId) : Promise.resolve({ data: [], error: null, missingTable: false }),
    [],
    [athleteId],
  )
}

export function useWorkouts(athleteId: string | undefined, options: { since?: Date; limit?: number } = {}) {
  const since = options.since?.getTime()
  return useFocusQuery<Workout[]>(
    () => athleteId ? listWorkouts(athleteId, options) : Promise.resolve({ data: [], error: null, missingTable: false }),
    [],
    [athleteId, since, options.limit],
  )
}

// Último diagnóstico ou simulado salvo em station_times
export function useLatestStationTimes(athleteId: string | undefined) {
  return useFocusQuery<Record<string, unknown> | null>(
    async () => {
      if (!athleteId) return { data: null, error: null, missingTable: false }
      const { data, error } = await supabase
        .from('station_times')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return { data, error: error?.message ?? null, missingTable: false }
    },
    null,
    [athleteId],
  )
}
