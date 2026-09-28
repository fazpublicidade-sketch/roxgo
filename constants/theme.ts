import { TextStyle } from 'react-native'

export const COLORS = {
  // Superfícies (estilo Strava dark: fundo quase preto, cards planos)
  bg: '#161618',
  surface: '#1F1F22',
  surfaceAlt: '#2A2A2E',
  border: '#2E2E33',
  divider: '#26262A',
  sectionGap: '#0E0E10',

  // Tipografia
  text: '#FFFFFF',
  textMuted: '#9B9BA1',
  textDim: '#6A6A72',

  // Acentos
  primary: '#00E64D',
  primaryDim: 'rgba(0,230,77,0.12)',
  onPrimary: '#000000',

  // Status
  danger: '#FF4D3D',
  warning: '#FFB800',
  success: '#00E64D',
}

// Manrope carregada em App.tsx; em fontes customizadas cada peso é uma família.
// Números grandes usam os pesos finos (thin/light); texto usa regular a bold.
export const FONTS = {
  thin: 'Manrope_200ExtraLight',
  light: 'Manrope_300Light',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
}

export const TYPE: Record<'display' | 'title' | 'heading' | 'label' | 'value' | 'body' | 'caption', TextStyle> = {
  display: { fontFamily: FONTS.thin, fontSize: 56, letterSpacing: -1.5, color: COLORS.text },
  title: { fontFamily: FONTS.bold, fontSize: 28, letterSpacing: -0.6, color: COLORS.text },
  heading: { fontFamily: FONTS.bold, fontSize: 17, letterSpacing: -0.2, color: COLORS.text },
  label: { fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.textMuted },
  value: { fontFamily: FONTS.light, fontSize: 22, letterSpacing: -0.3, color: COLORS.text, fontVariant: ['tabular-nums'] },
  body: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 21, color: COLORS.textMuted },
  caption: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textDim },
}

export const ICON = { size: 22, stroke: 1.75 }

// Degradê dos botões de ação: azul → verde da logo, um tom mais escuro.
// Mantido claro o suficiente para texto preto continuar legível.
export const ACTION_GRADIENT = {
  colors: ['#0B7A94', '#0E9A6A', '#18B53E'] as const,
  start: { x: 0, y: 0.5 },
  end: { x: 1, y: 0.5 },
}
