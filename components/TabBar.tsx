import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dumbbell, Flag, House, LucideIcon, User } from 'lucide-react-native'
import { COLORS, FONTS, ICON } from '../constants/theme'

const TABS: Record<string, { icon: LucideIcon; label: string }> = {
  Inicio: { icon: House, label: 'Início' },
  Treinar: { icon: Dumbbell, label: 'Treinar' },
  Provas: { icon: Flag, label: 'Provas' },
  Perfil: { icon: User, label: 'Perfil' },
}

// Barra inferior no padrão Strava/Roxfit, com o botão de gravar no centro
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index

        if (route.name === 'GravarTab') {
          return (
            <View key={route.key} style={styles.item}>
              <Pressable
                onPress={() => navigation.navigate(state.routes[state.index].name, { screen: 'EscolherTreino' })}
                accessibilityRole="button"
                accessibilityLabel="Gravar treino"
                style={({ pressed }) => [styles.record, pressed && styles.pressed]}
              >
                <View style={styles.recordDot} />
              </Pressable>
            </View>
          )
        }

        const tab = TABS[route.name]
        const color = focused ? COLORS.primary : COLORS.textMuted
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            style={styles.item}
          >
            <tab.icon size={ICON.size + 2} color={color} strokeWidth={focused ? 2.1 : ICON.stroke} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: FONTS.semibold, fontSize: 11 },
  // Botão de gravar: anel branco grosso com o miolo preto
  record: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
  },
  recordDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
  },
  pressed: { opacity: 0.85 },
})
