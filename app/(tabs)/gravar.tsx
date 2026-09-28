import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { Flag, Pause, Play, SkipForward, X } from 'lucide-react-native'
import type { AppStackParamList } from '../../lib/navigation'
import { supabase } from '../../lib/supabase'
import { confirmAction, showAlert } from '../../lib/alert'
import { useAthlete } from '../../lib/athlete'
import { saveWorkout } from '../../lib/data'
import Screen from '../../components/Screen'
import { ActionGradient, Card, IconTile, PrimaryButton, SecondaryButton, Stat } from '../../components/ui'
import { COLORS, FONTS, ICON, TYPE } from '../../constants/theme'
import {
  benchmarksFor,
  deficitColor,
  formatClock,
  formatDeficit,
  lapsToStationTimes,
  stationByKey,
  WORKOUT_STAGES,
  WorkoutStage,
} from '../../constants/hyrox'

type Props = NativeStackScreenProps<AppStackParamList, 'Gravar'>
type Status = 'idle' | 'running' | 'paused' | 'finished'

const KEEP_AWAKE_TAG = 'roxgo-workout'
const MIN_STAGE_MS = 2000

// Sem estação: simulado completo (16 etapas). Com estação: teste isolado de uma etapa.
function stagesFor(stationKey: WorkoutStage['key'] | undefined): WorkoutStage[] {
  if (!stationKey) return WORKOUT_STAGES
  const s = stationByKey(stationKey)
  const isRun = s.key === 'run_avg'
  return [{ key: s.key, icon: s.icon, name: isRun ? 'Corrida' : s.name, reference: isRun ? '1 km' : s.reference }]
}

export default function Gravar({ navigation, route }: Props) {
  const stationKey = route.params?.station
  const stages = stagesFor(stationKey)
  const TOTAL = stages.length
  const isTest = Boolean(stationKey)
  const { athlete } = useAthlete()
  const [status, setStatus] = useState<Status>('idle')
  const [laps, setLaps] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [, setTick] = useState(0)

  // O tempo é calculado por timestamps, não por contagem de ticks, para não atrasar
  const startedAt = useRef(0)
  const pausedTotal = useRef(0)
  const pausedAt = useRef(0)
  const stageStart = useRef(0)
  const finalElapsed = useRef(0)
  const allowLeave = useRef(false)

  function elapsed() {
    if (status === 'idle') return 0
    if (status === 'finished') return finalElapsed.current
    const now = status === 'paused' ? pausedAt.current : Date.now()
    return now - startedAt.current - pausedTotal.current
  }

  // Redesenha o cronômetro enquanto está rodando
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setTick((t) => t + 1), 200)
    return () => clearInterval(id)
  }, [status])

  // Tela sempre ligada durante o treino
  useEffect(() => {
    if (status !== 'running' && status !== 'paused') return
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {})
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {})
    }
  }, [status])

  // Pede confirmação antes de sair com um treino em andamento
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (allowLeave.current || status === 'idle') return
      e.preventDefault()
      confirmAction('Descartar treino?', 'O treino em andamento será perdido.', 'Descartar').then((ok) => {
        if (!ok) return
        allowLeave.current = true
        navigation.dispatch(e.data.action)
      })
    })
  }, [navigation, status])

  function start() {
    startedAt.current = Date.now()
    pausedTotal.current = 0
    stageStart.current = 0
    setLaps([])
    setStatus('running')
  }

  function pause() {
    pausedAt.current = Date.now()
    setStatus('paused')
  }

  function resume() {
    pausedTotal.current += Date.now() - pausedAt.current
    setStatus('running')
  }

  function nextStage() {
    const now = elapsed()
    // Ignora toque duplo acidental: uma etapa precisa de pelo menos 2 segundos
    if (now - stageStart.current < MIN_STAGE_MS) return
    const next = [...laps, now - stageStart.current]
    stageStart.current = now
    setLaps(next)
    if (next.length === TOTAL) {
      finalElapsed.current = now
      setStatus('finished')
    }
  }

  async function discard() {
    const ok = await confirmAction('Descartar treino?', 'Os tempos gravados serão perdidos.', 'Descartar')
    if (!ok) return
    allowLeave.current = true
    navigation.goBack()
  }

  async function save() {
    if (!athlete) return
    setSaving(true)
    const workout = await saveWorkout({
      athlete_id: athlete.id,
      type: isTest ? 'estacao' : 'simulado',
      station: stationKey ?? null,
      total_ms: Math.round(finalElapsed.current),
      splits: laps.map((ms, i) => ({ key: stages[i].key, ms: Math.round(ms) })),
    })

    if (isTest) {
      setSaving(false)
      if (workout.error) {
        showAlert('Erro ao salvar', workout.error)
        return
      }
      allowLeave.current = true
      navigation.goBack()
      return
    }

    // Simulado completo também alimenta a análise de gargalos
    const { error } = await supabase
      .from('station_times')
      .insert({ athlete_id: athlete.id, ...lapsToStationTimes(laps) })
    setSaving(false)
    if (error) {
      showAlert('Erro ao salvar', error.message)
      return
    }
    if (workout.error) showAlert('Treino salvo só na análise', workout.error)
    allowLeave.current = true
    navigation.replace('Resultado', { athleteId: athlete.id, category: athlete.category ?? '' })
  }

  const total = elapsed()
  const stageIndex = Math.min(laps.length, TOTAL - 1)
  const stage = stages[stageIndex]
  const nextUp = stages[stageIndex + 1]
  const isLast = laps.length === TOTAL - 1
  const title = isTest ? `Teste · ${stages[0].name}` : 'Simulado HYROX'

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
        <X size={24} color={COLORS.text} strokeWidth={ICON.stroke} />
      </Pressable>
      <Text style={styles.headerTitle}>{status === 'finished' ? 'Resumo do treino' : title}</Text>
      <View style={styles.headerSide} />
    </View>
  )

  if (status === 'finished' && isTest) {
    const ideal = benchmarksFor(athlete?.category)[stages[0].key] * 1000
    const deficit = total / ideal - 1
    const color = deficitColor(deficit, COLORS)
    return (
      <Screen
        header={header}
        footer={
          <View style={styles.footer}>
            <PrimaryButton title="Salvar teste" onPress={save} loading={saving} />
            <SecondaryButton title="Descartar" onPress={discard} disabled={saving} style={styles.gap} />
          </View>
        }
      >
        <View style={styles.testHead}>
          <IconTile icon={stages[0].icon} color={color} size={56} />
          <Text style={[TYPE.title, styles.center]}>{stages[0].name}</Text>
          <Text style={[TYPE.body, styles.center]}>{stages[0].reference}</Text>
        </View>
        <Text style={[styles.bigClock, styles.center]}>{formatClock(total)}</Text>
        <View style={styles.stats}>
          <Stat label="Ideal" value={formatClock(ideal)} />
          <Stat label="Diferença" value={`${deficit > 0 ? '+' : ''}${Math.round(deficit * 100)}%`} color={color} />
        </View>
        <Text style={[TYPE.body, styles.center, { color }]}>{formatDeficit(deficit)}</Text>
      </Screen>
    )
  }

  if (status === 'finished') {
    const runMs = laps.filter((_, i) => stages[i].key === 'run_avg').reduce((a, b) => a + b, 0)
    return (
      <Screen
        header={header}
        footer={
          <View style={styles.footer}>
            <PrimaryButton title="Salvar treino" onPress={save} loading={saving} />
            <SecondaryButton title="Descartar" onPress={discard} disabled={saving} style={styles.gap} />
          </View>
        }
      >
        <Text style={[TYPE.caption, styles.center]}>Tempo total</Text>
        <Text style={[styles.bigClock, styles.center]}>{formatClock(total)}</Text>
        <View style={styles.stats}>
          <Stat label="Corridas" value={formatClock(runMs)} />
          <Stat label="Estações" value={formatClock(total - runMs)} />
          <Stat label="Pace médio" value={`${formatClock(runMs / 8)}/km`} />
        </View>
        <SplitList laps={laps} stages={stages} />
      </Screen>
    )
  }

  const controls =
    status === 'idle' ? (
      <View style={styles.controls}>
        <Pressable onPress={start} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          <ActionGradient />
          <View><Play size={30} color={COLORS.onPrimary} fill={COLORS.onPrimary} strokeWidth={ICON.stroke} /></View>
        </Pressable>
        <Text style={[TYPE.caption, styles.controlLabel]}>Iniciar</Text>
      </View>
    ) : status === 'running' ? (
      <View style={styles.controlsRow}>
        <Pressable onPress={pause} style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
          <Pause size={26} color={COLORS.text} strokeWidth={ICON.stroke} />
        </Pressable>
        <Pressable onPress={nextStage} style={({ pressed }) => [styles.lapButton, pressed && styles.pressed]}>
          <ActionGradient />
          <View>{isLast ? <Flag size={20} color={COLORS.onPrimary} strokeWidth={2} /> : <SkipForward size={20} color={COLORS.onPrimary} strokeWidth={2} />}</View>
          <Text style={styles.lapText}>{isLast ? 'Finalizar' : 'Próxima etapa'}</Text>
        </Pressable>
      </View>
    ) : (
      <View style={styles.controlsRow}>
        <Pressable onPress={resume} style={({ pressed }) => [styles.roundButton, styles.resume, pressed && styles.pressed]}>
          <ActionGradient />
          <View><Play size={26} color={COLORS.onPrimary} fill={COLORS.onPrimary} strokeWidth={ICON.stroke} /></View>
        </Pressable>
        <Pressable onPress={discard} style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}>
          <Text style={styles.endText}>Encerrar</Text>
        </Pressable>
      </View>
    )

  return (
    <Screen header={header} footer={<View style={styles.footer}>{controls}</View>}>
      <View style={styles.progress}>
        {stages.map((s, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < laps.length && styles.segmentDone,
              i === laps.length && status !== 'idle' && styles.segmentCurrent,
            ]}
          />
        ))}
      </View>

      <Text style={[TYPE.caption, styles.stageCount]}>
        {status === 'paused' ? 'PAUSADO · ' : ''}
        {isTest ? 'TESTE DE ESTAÇÃO' : `ETAPA ${stageIndex + 1} DE ${TOTAL}`}
      </Text>
      <View style={styles.stageRow}>
        <IconTile icon={stage.icon} color={COLORS.primary} size={48} />
        <View style={styles.flex}>
          <Text style={TYPE.title}>{stage.name}</Text>
          <Text style={TYPE.body}>{stage.reference}</Text>
        </View>
      </View>

      <Text style={[styles.bigClock, status === 'paused' && styles.pausedClock]}>
        {formatClock(total - stageStart.current)}
      </Text>

      {isTest ? (
        <View style={styles.stats}>
          <Stat label="Ideal da categoria" value={formatClock(benchmarksFor(athlete?.category)[stages[0].key] * 1000)} />
        </View>
      ) : (
        <View style={styles.stats}>
          <Stat label="Tempo total" value={formatClock(total)} />
          <Stat label="Etapas" value={`${laps.length}/${TOTAL}`} />
        </View>
      )}

      {nextUp && (
        <Text style={TYPE.body}>
          A seguir: <Text style={styles.nextName}>{nextUp.name}</Text>
        </Text>
      )}

      {laps.length > 0 && <SplitList laps={laps} stages={stages} newestFirst />}
    </Screen>
  )
}

function SplitList({ laps, stages, newestFirst }: { laps: number[]; stages: WorkoutStage[]; newestFirst?: boolean }) {
  const rows = laps.map((ms, i) => ({ ms, stage: stages[i], index: i }))
  if (newestFirst) rows.reverse()
  return (
    <>
      <Text style={styles.section}>Parciais</Text>
      <Card style={styles.list}>
        {rows.map(({ ms, stage, index }, i) => (
          <View key={index} style={[styles.splitRow, i < rows.length - 1 && styles.divider]}>
            <Text style={styles.splitIndex}>{index + 1}</Text>
            <stage.icon size={18} color={COLORS.textMuted} strokeWidth={ICON.stroke} />
            <Text style={[TYPE.heading, styles.flex]}>{stage.name}</Text>
            <Text style={styles.splitTime}>{formatClock(ms)}</Text>
          </View>
        ))}
      </Card>
    </>
  )
}

const TABULAR = { fontVariant: ['tabular-nums' as const] }

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerSide: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 17 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  testHead: { alignItems: 'center', gap: 6, marginTop: 8 },
  gap: { marginTop: 10 },
  progress: { flexDirection: 'row', gap: 3, marginTop: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.surfaceAlt },
  segmentDone: { backgroundColor: COLORS.primary },
  segmentCurrent: { backgroundColor: COLORS.textMuted },
  stageCount: { letterSpacing: 1.2, marginTop: 24, marginBottom: 12 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bigClock: {
    fontFamily: FONTS.thin,
    fontSize: 92,
    letterSpacing: -2,
    color: COLORS.text,
    marginTop: 20,
    ...TABULAR,
  },
  pausedClock: { color: COLORS.textDim },
  stats: {
    flexDirection: 'row',
    paddingVertical: 16,
    marginVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  nextName: { fontFamily: FONTS.semibold, color: COLORS.text },
  section: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 18, marginTop: 24, marginBottom: 10 },
  list: { paddingVertical: 4 },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  splitIndex: { fontFamily: FONTS.medium, color: COLORS.textDim, fontSize: 13, width: 20, ...TABULAR },
  splitTime: { fontFamily: FONTS.regular, color: COLORS.text, fontSize: 17, ...TABULAR },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  controls: { alignItems: 'center' },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', maxWidth: 520, alignSelf: 'center' },
  startButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: { marginTop: 8 },
  roundButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resume: { overflow: 'hidden' },
  lapButton: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lapText: { fontFamily: FONTS.bold, color: COLORS.onPrimary, fontSize: 17 },
  endButton: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: { fontFamily: FONTS.bold, color: COLORS.danger, fontSize: 17 },
  pressed: { opacity: 0.8 },
})
