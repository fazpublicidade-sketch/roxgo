import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native'
import { COLORS, FONTS, ICON } from '../constants/theme'
import { addDays, sameDay, startOfWeek } from '../lib/date'

const LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

// Semanas seguidas com pelo menos um treino. A semana atual só quebra a
// sequência depois que termina, como no Strava.
export function weekStreak(dates: Date[]) {
  const weeks = new Set(dates.map((d) => startOfWeek(d).getTime()))
  let cursor = startOfWeek(new Date())
  if (!weeks.has(cursor.getTime())) cursor = addDays(cursor, -7)
  let count = 0
  while (weeks.has(cursor.getTime())) {
    count++
    cursor = addDays(cursor, -7)
  }
  return count
}

export default function WeekStreak({ dates }: { dates: Date[] }) {
  const [offset, setOffset] = useState(0)
  const streak = useMemo(() => weekStreak(dates), [dates])
  const today = new Date()
  const weekStart = addDays(startOfWeek(today), offset * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>{offset === 0 ? 'Sua sequência' : weekLabel(weekStart)}</Text>
        <View style={styles.arrows}>
          <Pressable onPress={() => setOffset((o) => o - 1)} style={styles.arrow} hitSlop={6} accessibilityLabel="Semana anterior">
            <ChevronLeft size={20} color={COLORS.text} strokeWidth={ICON.stroke} />
          </Pressable>
          <Pressable
            onPress={() => setOffset((o) => Math.min(0, o + 1))}
            disabled={offset === 0}
            style={[styles.arrow, offset === 0 && styles.disabled]}
            hitSlop={6}
            accessibilityLabel="Próxima semana"
          >
            <ChevronRight size={20} color={COLORS.text} strokeWidth={ICON.stroke} />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.streak}>
          <Text style={[styles.streakValue, streak === 0 && styles.muted]}>{streak}</Text>
          <Text style={[styles.streakLabel, streak === 0 && styles.muted]}>{streak === 1 ? 'Semana' : 'Semanas'}</Text>
        </View>

        <View style={styles.days}>
          {days.map((day, i) => {
            const isToday = sameDay(day, today)
            const trained = dates.some((d) => sameDay(d, day))
            const future = day > today && !isToday
            return (
              <View key={i} style={styles.day}>
                <Text style={styles.letter}>{LETTERS[i]}</Text>
                <View
                  style={[
                    styles.circle,
                    trained && styles.circleTrained,
                    isToday && styles.circleToday,
                    future && styles.circleFuture,
                  ]}
                >
                  {trained ? (
                    <Check size={16} color={COLORS.onPrimary} strokeWidth={3} />
                  ) : (
                    <Text style={[styles.date, isToday && styles.dateToday, future && styles.muted]}>{day.getDate()}</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

function weekLabel(start: Date) {
  const end = addDays(start, 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')
  return `${fmt(start)} – ${fmt(end)}`
}

const CIRCLE = 36

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 17 },
  arrows: { flexDirection: 'row', gap: 8 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streak: { width: 64, alignItems: 'center' },
  streakValue: { fontFamily: FONTS.light, color: COLORS.primary, fontSize: 34, letterSpacing: -1, lineHeight: 38 },
  streakLabel: { fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 11 },
  muted: { color: COLORS.textDim },
  days: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 8 },
  letter: { fontFamily: FONTS.medium, color: COLORS.textMuted, fontSize: 12 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleTrained: { backgroundColor: COLORS.text },
  circleToday: { backgroundColor: COLORS.primary },
  circleFuture: { backgroundColor: 'transparent' },
  date: { fontFamily: FONTS.medium, color: COLORS.text, fontSize: 14 },
  dateToday: { color: COLORS.onPrimary },
})
