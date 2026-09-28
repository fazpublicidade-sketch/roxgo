import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../../lib/navigation'
import { supabase } from '../../lib/supabase'
import { showAlert } from '../../lib/alert'
import { useAthlete } from '../../lib/athlete'
import Screen from '../../components/Screen'
import { BackHeader, Card, IconTile, PrimaryButton } from '../../components/ui'
import { COLORS, FONTS, TYPE } from '../../constants/theme'
import { parseTime, StationKey, STATIONS } from '../../constants/hyrox'

type Props = NativeStackScreenProps<AppStackParamList, 'Diagnostico'>

export default function Diagnostico({ navigation }: Props) {
  const { athlete } = useAthlete()
  const [values, setValues] = useState<Partial<Record<StationKey, string>>>({})
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!athlete) return

    const times: Partial<Record<StationKey, number>> = {}
    for (const station of STATIONS) {
      const raw = values[station.key]?.trim()
      if (!raw) {
        showAlert('Atenção', 'Preencha o tempo de todas as estações')
        return
      }
      const seconds = parseTime(raw)
      if (seconds === null) {
        showAlert('Tempo inválido', `${station.name}: use segundos (ex: 95) ou mm:ss (ex: 1:35)`)
        return
      }
      times[station.key] = seconds
    }

    setSaving(true)
    const { error } = await supabase.from('station_times').insert({ athlete_id: athlete.id, ...times })
    setSaving(false)
    if (error) {
      showAlert('Erro ao salvar', error.message)
      return
    }
    navigation.navigate('Resultado', { athleteId: athlete.id, category: athlete.category ?? '' })
  }

  return (
    <Screen header={<BackHeader title="Diagnóstico" onBack={() => navigation.goBack()} />}>
      <Text style={[TYPE.title, styles.title]}>Insira seus tempos</Text>
      <Text style={TYPE.body}>
        Use seus tempos médios reais de treino ou prova. Quanto mais preciso, melhor a análise.
      </Text>
      <Text style={[TYPE.caption, styles.hint]}>Aceita segundos (95) ou minutos:segundos (1:35)</Text>

      <Card style={styles.list}>
        {STATIONS.map((station, i) => (
          <View key={station.key} style={[styles.row, i < STATIONS.length - 1 && styles.divider]}>
            <IconTile icon={station.icon} color={COLORS.primary} />
            <View style={styles.info}>
              <Text style={TYPE.heading}>{station.name}</Text>
              <Text style={[TYPE.body, styles.ref]}>{station.reference}</Text>
            </View>
            <View style={styles.field}>
              <TextInput
                value={values[station.key] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [station.key]: t.replace(/[^\d:]/g, '') }))}
                placeholder="0:00"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numbers-and-punctuation"
                maxLength={6}
                style={styles.input}
              />
              <Text style={styles.unit}>{station.unit}</Text>
            </View>
          </View>
        ))}
      </Card>

      <PrimaryButton title="Analisar performance" onPress={submit} loading={saving} style={styles.submit} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 6 },
  hint: { marginTop: 10 },
  list: { marginTop: 20, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  info: { flex: 1 },
  ref: { fontSize: 13, marginTop: 1 },
  field: { alignItems: 'center' },
  input: {
    width: 76,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 16,
    textAlign: 'center',
    outlineStyle: 'none' as never,
  },
  unit: { fontFamily: FONTS.medium, color: COLORS.textDim, fontSize: 10, marginTop: 4 },
  submit: { marginTop: 8, marginBottom: 12 },
})
