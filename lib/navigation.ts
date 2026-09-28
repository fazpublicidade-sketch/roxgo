import type { NavigatorScreenParams } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { StationKey } from '../constants/hyrox'

// Telas que abrem dentro de qualquer aba, mantendo a barra inferior visível
export type AppStackParamList = {
  InicioRoot: undefined
  TreinarRoot: undefined
  ProvasRoot: undefined
  PerfilRoot: undefined
  EscolherTreino: undefined
  Gravar: { station?: StationKey } | undefined
  Diagnostico: undefined
  Resultado: { athleteId: string; category: string }
  NovaProva: undefined
  EditarPerfil: undefined
}

export type TabParamList = {
  Inicio: NavigatorScreenParams<AppStackParamList> | undefined
  Treinar: NavigatorScreenParams<AppStackParamList> | undefined
  GravarTab: undefined
  Provas: NavigatorScreenParams<AppStackParamList> | undefined
  Perfil: NavigatorScreenParams<AppStackParamList> | undefined
}

export type RootParamList = {
  Login: undefined
  Onboarding: undefined
  Tabs: NavigatorScreenParams<TabParamList> | undefined
}

export type AppNavigation = NativeStackNavigationProp<AppStackParamList>

// Navegação da pilha da aba atual
export const useAppNavigation = () => useNavigation<AppNavigation>()
