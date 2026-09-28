import { useEffect, useRef, useState } from 'react'
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { LucideIcon, Target, Trophy, User, Zap } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'
import { showAlert } from '../../lib/alert'
import { useAthlete } from '../../lib/athlete'
import { addRace } from '../../lib/data'
import { maskDate, toIsoDate } from '../../lib/date'
import Screen from '../../components/Screen'
import { Chip, IconTile, Input, OptionRow, PrimaryButton } from '../../components/ui'
import { COLORS, FONTS, TYPE } from '../../constants/theme'
import { CATEGORIES, CATEGORY_LABELS, EXPERIENCES } from '../../constants/hyrox'

const STEPS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: User, title: 'Como você se chama?', subtitle: 'Vamos personalizar sua experiência' },
  { icon: Trophy, title: 'Qual é sua próxima prova?', subtitle: 'Vamos contar os dias até a largada' },
  { icon: Zap, title: 'Qual categoria você vai competir?', subtitle: 'Seus benchmarks dependem dela' },
  { icon: Target, title: 'Qual seu nível atual?', subtitle: 'Ajuda a calibrar sua análise' },
]

export default function Onboarding() {
  const { refreshAthlete } = useAthlete()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [nextRace, setNextRace] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [experience, setExperience] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const slide = useRef(new Animated.Value(0)).current
  const direction = useRef(1)

  useEffect(() => {
    slide.setValue(direction.current)
    Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' }).start()
  }, [step, slide])

  function goTo(next: number) {
    direction.current = next > step ? 1 : -1
    setStep(next)
  }

  function next() {
    if (step === 0 && !name.trim()) {
      showAlert('Atenção', 'Digite seu nome')
      return
    }
    if (step === 1) {
      if (!nextRace.trim() || !raceDate) {
        showAlert('Atenção', 'Preencha todos os campos')
        return
      }
      if (!toIsoDate(raceDate)) {
        showAlert('Atenção', 'Data inválida. Use o formato DD/MM/AAAA')
        return
      }
    }
    goTo(step + 1)
  }

  async function finish() {
    if (!experience) return
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSaving(false)
      showAlert('Erro', 'Sessão expirada. Entre novamente.')
      return
    }
    const isoDate = toIsoDate(raceDate)
    const { error } = await supabase.from('athletes').upsert({
      id: session.user.id,
      name: name.trim(),
      email: session.user.email,
      next_race: nextRace.trim(),
      race_date: isoDate,
      category,
      experience,
    })
    if (error) {
      setSaving(false)
      showAlert('Erro ao salvar', error.message)
      return
    }
    // Também entra na lista de provas; se a tabela ainda não existir, a Home usa a do perfil
    if (isoDate) {
      await addRace({ athlete_id: session.user.id, name: nextRace.trim(), race_date: isoDate, category })
    }
    // Com o perfil salvo, o App troca para as abas
    await refreshAthlete()
  }

  const translateX = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: [-24, 0, 24] })
  const opacity = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] })
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => goTo(step - 1)} disabled={step === 0 || saving} hitSlop={12}>
          <Text style={[styles.back, step === 0 && styles.hidden]}>Voltar</Text>
        </Pressable>
        <Text style={TYPE.caption}>
          {step + 1} de {STEPS.length}
        </Text>
      </View>
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.segment, i <= step && styles.segmentActive]} />
        ))}
      </View>

      <Animated.View style={[styles.body, { opacity, transform: [{ translateX }] }]}>
        <IconTile icon={current.icon} color={COLORS.primary} size={52} />
        <Text style={[TYPE.title, styles.title]}>{current.title}</Text>
        <Text style={[TYPE.body, styles.subtitle]}>{current.subtitle}</Text>

        {step === 0 && (
          <Input placeholder="Seu nome" value={name} onChangeText={setName} autoFocus onSubmitEditing={next} />
        )}

        {step === 1 && (
          <>
            <Input placeholder="Ex: HYROX São Paulo" value={nextRace} onChangeText={setNextRace} />
            <Input
              placeholder="Data da prova (DD/MM/AAAA)"
              value={raceDate}
              onChangeText={(t) => setRaceDate(maskDate(t))}
              keyboardType="number-pad"
              maxLength={10}
              style={styles.gap}
              onSubmitEditing={next}
            />
          </>
        )}

        {step === 2 && (
          <View style={styles.grid}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={CATEGORY_LABELS[c]} selected={category === c} onPress={() => setCategory(c)} style={styles.chip} />
            ))}
          </View>
        )}

        {step === 3 &&
          EXPERIENCES.map((e) => (
            <OptionRow
              key={e.value}
              title={e.label}
              description={e.description}
              selected={experience === e.value}
              onPress={() => setExperience(e.value)}
            />
          ))}
      </Animated.View>

      {last ? (
        <PrimaryButton title="Começar" onPress={finish} loading={saving} disabled={!experience} />
      ) : (
        <PrimaryButton title="Continuar" onPress={next} disabled={step === 2 && !category} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  back: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.text },
  hidden: { opacity: 0 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: COLORS.surfaceAlt },
  segmentActive: { backgroundColor: COLORS.primary },
  body: { flexGrow: 1, paddingTop: 40, paddingBottom: 24 },
  title: { marginTop: 20 },
  subtitle: { marginTop: 6, marginBottom: 28 },
  gap: { marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  chip: { width: '48.5%', height: 64 },
})
