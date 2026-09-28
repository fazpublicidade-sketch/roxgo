import { ReactNode, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, LucideIcon } from 'lucide-react-native'
import { ACTION_GRADIENT, COLORS, FONTS, ICON, TYPE } from '../constants/theme'

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Label({ children, style }: { children: ReactNode; style?: TextStyle | TextStyle[] }) {
  return <Text style={[TYPE.label, style]}>{children}</Text>
}

// Ícone de linha dentro de um quadrado arredondado
export function IconTile({ icon: Icon, color = COLORS.text, size = 40 }: { icon: LucideIcon; color?: string; size?: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Icon size={size * 0.5} color={color} strokeWidth={ICON.stroke} />
    </View>
  )
}

// Bloco de estatística estilo Strava: rótulo pequeno em cima, valor forte embaixo
export function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={TYPE.label}>{label}</Text>
      <Text style={[TYPE.value, color ? { color } : null]}>{value}</Text>
    </View>
  )
}

// Linha de lista: ícone, título, subtítulo e chevron
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  disabled,
  last,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  onPress?: () => void
  right?: ReactNode
  disabled?: boolean
  last?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <View style={disabled && styles.dimmed}>
        <IconTile icon={icon} color={disabled ? COLORS.textMuted : COLORS.primary} />
      </View>
      <View style={[styles.rowText, disabled && styles.dimmed]}>
        <Text style={TYPE.heading}>{title}</Text>
        {subtitle ? <Text style={[TYPE.body, styles.rowSub]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={20} color={COLORS.textDim} strokeWidth={ICON.stroke} /> : null)}
    </Pressable>
  )
}

export function Badge({ children }: { children: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  )
}

// Fundo em degradê para botões de ação (o botão precisa de overflow: 'hidden').
// Na web ele fica por cima de SVGs soltos: envolva ícones numa View.
export function ActionGradient() {
  return (
    <LinearGradient
      colors={ACTION_GRADIENT.colors}
      start={ACTION_GRADIENT.start}
      end={ACTION_GRADIENT.end}
      style={StyleSheet.absoluteFill}
    />
  )
}

export function Input({ icon: Icon, style, secureTextEntry, ...props }: TextInputProps & { icon?: LucideIcon }) {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)
  const EyeIcon = hidden ? Eye : EyeOff
  return (
    <View style={[styles.inputWrap, focused && styles.inputFocused, style as ViewStyle]}>
      {Icon ? <Icon size={18} color={focused ? COLORS.text : COLORS.textDim} strokeWidth={ICON.stroke} /> : null}
      <TextInput
        placeholderTextColor={COLORS.textDim}
        {...props}
        secureTextEntry={secureTextEntry && hidden}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        style={styles.input}
      />
      {secureTextEntry ? (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
        >
          <EyeIcon size={20} color={COLORS.textMuted} strokeWidth={ICON.stroke} />
        </Pressable>
      ) : null}
    </View>
  )
}

type ButtonProps = {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function PrimaryButton({ title, onPress, loading, disabled, style }: ButtonProps) {
  const inactive = disabled || loading
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, styles.primary, inactive && styles.disabled, pressed && styles.pressed, style]}
    >
      <ActionGradient />
      {loading ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.primaryText}>{title}</Text>}
    </Pressable>
  )
}

export function SecondaryButton({ title, onPress, loading, disabled, style }: ButtonProps) {
  const inactive = disabled || loading
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, styles.secondary, inactive && styles.disabled, pressed && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={COLORS.text} /> : <Text style={styles.secondaryText}>{title}</Text>}
    </Pressable>
  )
}

export function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
        <ChevronLeft size={26} color={COLORS.text} strokeWidth={ICON.stroke} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSide} />
    </View>
  )
}

export function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  tile: {
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  rowPressed: { opacity: 0.6 },
  rowText: { flex: 1 },
  rowSub: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  dimmed: { opacity: 0.45 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
  },
  badgeText: { fontFamily: FONTS.semibold, fontSize: 11, color: COLORS.textMuted },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: COLORS.textDim },
  input: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: 16,
    paddingVertical: 15,
    // Remove o contorno padrão do navegador
    outlineStyle: 'none' as never,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  primary: { overflow: 'hidden' },
  primaryText: { fontFamily: FONTS.bold, color: COLORS.onPrimary, fontSize: 16 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  secondaryText: { fontFamily: FONTS.semibold, color: COLORS.text, fontSize: 16 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8 },
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
  headerTitle: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 17, flex: 1, textAlign: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: COLORS.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
})

// Título de seção com ação opcional à direita ("Ver tudo")
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={extra.sectionRow}>
      <Text style={extra.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={extra.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

// Opção selecionável em grade (ex: categoria)
export function Chip({ label, selected, onPress, style }: { label: string; selected: boolean; onPress: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} style={[extra.chip, selected && extra.selected, style]}>
      <Text style={[extra.chipText, selected && extra.chipTextSelected]}>{label}</Text>
    </Pressable>
  )
}

// Opção em lista com descrição e marcador (ex: nível)
export function OptionRow({
  title,
  description,
  selected,
  onPress,
}: {
  title: string
  description?: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={[extra.option, selected && extra.selected]}>
      <View style={extra.optionText}>
        <Text style={TYPE.heading}>{title}</Text>
        {description ? <Text style={[TYPE.body, extra.optionDesc]}>{description}</Text> : null}
      </View>
      <View style={[extra.radio, selected && extra.radioSelected]}>
        {selected ? <Check size={14} color={COLORS.onPrimary} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  )
}

export function Avatar({ name, size = 36 }: { name: string | null | undefined; size?: number }) {
  const initial = (name?.trim()[0] ?? '?').toUpperCase()
  return (
    <View style={[extra.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[extra.avatarText, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  )
}

const extra = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 20, letterSpacing: -0.3 },
  sectionAction: { fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 14 },
  chip: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selected: { borderColor: COLORS.primary },
  chipText: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.text },
  chipTextSelected: { color: COLORS.primary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  optionText: { flex: 1 },
  optionDesc: { fontSize: 13, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  avatar: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.bold, color: COLORS.onPrimary },
})
