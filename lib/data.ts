import { supabase } from './supabase'
import type { StationKey } from '../constants/hyrox'

export type Race = {
  id: string
  athlete_id: string
  name: string
  race_date: string
  city: string | null
  category: string | null
  created_at: string
}

export type Split = { key: StationKey; ms: number }

export type Workout = {
  id: string
  athlete_id: string
  type: 'simulado' | 'estacao'
  station: StationKey | null
  total_ms: number
  splits: Split[]
  performed_at: string
}

type Result<T> = { data: T; error: string | null; missingTable: boolean }

// Tabela ainda não criada (migração supabase/migrations/20260927_races_workouts.sql não rodou)
function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === '42P01' || error.code === 'PGRST205' || /could not find the table/i.test(error.message ?? '')
}

export const MISSING_TABLE_MESSAGE =
  'O banco ainda não tem as tabelas de provas e treinos. Rode a migração do Supabase para liberar esta função.'

function wrap<T>(data: T | null, error: { code?: string; message?: string } | null, fallback: T): Result<T> {
  return {
    data: data ?? fallback,
    error: error ? (isMissingTable(error) ? MISSING_TABLE_MESSAGE : error.message ?? 'Erro desconhecido') : null,
    missingTable: isMissingTable(error),
  }
}

export async function listRaces(athleteId: string): Promise<Result<Race[]>> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('race_date', { ascending: true })
  return wrap(data as Race[] | null, error, [])
}

export async function addRace(race: { athlete_id: string; name: string; race_date: string; city?: string | null; category?: string | null }) {
  const { error } = await supabase.from('races').insert(race)
  return wrap(null, error, null)
}

export async function deleteRace(id: string) {
  const { error } = await supabase.from('races').delete().eq('id', id)
  return wrap(null, error, null)
}

export async function listWorkouts(athleteId: string, options: { since?: Date; limit?: number } = {}): Promise<Result<Workout[]>> {
  let query = supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('performed_at', { ascending: false })
  if (options.since) query = query.gte('performed_at', options.since.toISOString())
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  return wrap(data as Workout[] | null, error, [])
}

export async function saveWorkout(workout: Omit<Workout, 'id' | 'performed_at'>) {
  const { error } = await supabase.from('workouts').insert(workout)
  return wrap(null, error, null)
}
