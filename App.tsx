import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { DarkTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Athlete, AthleteContext } from './lib/athlete'
import {
  useFonts,
  Manrope_200ExtraLight,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import { COLORS } from './constants/theme'
import { applyWebStyles } from './lib/webStyles'
import Login from './app/(auth)/login'
import Onboarding from './app/(auth)/onboarding'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { AppStackParamList, RootParamList, TabParamList } from './lib/navigation'
import TabBar from './components/TabBar'
import Home from './app/(tabs)/home'
import Treinar from './app/(tabs)/treinar'
import Provas from './app/(tabs)/provas'
import Perfil from './app/(tabs)/perfil'
import Diagnostico from './app/(tabs)/diagnostico'
import Resultado from './app/(tabs)/resultado'
import Gravar from './app/(tabs)/gravar'
import EscolherTreino from './app/(tabs)/escolher-treino'
import NovaProva from './app/(tabs)/nova-prova'
import EditarPerfil from './app/(tabs)/editar-perfil'

applyWebStyles()

const Stack = createNativeStackNavigator<RootParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// Cada aba tem a própria pilha com as telas compartilhadas, para a barra inferior
// continuar visível em todas as telas
function tabStack(rootName: 'InicioRoot' | 'TreinarRoot' | 'ProvasRoot' | 'PerfilRoot', Root: () => React.ReactNode) {
  return function TabStack() {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <AppStack.Screen name={rootName} component={Root} />
        <AppStack.Screen name="Diagnostico" component={Diagnostico} />
        <AppStack.Screen name="Resultado" component={Resultado} />
        <AppStack.Screen name="NovaProva" component={NovaProva} />
        <AppStack.Screen name="EditarPerfil" component={EditarPerfil} />
        <AppStack.Screen name="EscolherTreino" component={EscolherTreino} options={{ animation: 'slide_from_bottom' }} />
        <AppStack.Screen name="Gravar" component={Gravar} options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </AppStack.Navigator>
    )
  }
}

const InicioStack = tabStack('InicioRoot', Home)
const TreinarStack = tabStack('TreinarRoot', Treinar)
const ProvasStack = tabStack('ProvasRoot', Provas)
const PerfilStack = tabStack('PerfilRoot', Perfil)

// O botão central nunca abre esta aba: a TabBar abre EscolherTreino na aba atual
const Empty = () => null

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Inicio" component={InicioStack} />
      <Tab.Screen name="Treinar" component={TreinarStack} />
      <Tab.Screen name="GravarTab" component={Empty} />
      <Tab.Screen name="Provas" component={ProvasStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [loading, setLoading] = useState(true)
  const [fontsLoaded] = useFonts({
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  })

  const loadAthlete = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setAthlete(null)
      return
    }
    const { data } = await supabase.from('athletes').select('*').eq('id', userId).maybeSingle()
    setAthlete(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      await loadAthlete(session?.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Fora do callback para não travar o cliente de auth do Supabase
      setTimeout(() => loadAthlete(session?.user.id), 0)
    })

    return () => subscription.unsubscribe()
  }, [loadAthlete])

  const refreshAthlete = useCallback(() => loadAthlete(session?.user.id), [loadAthlete, session])

  if (loading || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AthleteContext.Provider value={{ athlete, refreshAthlete }}>
        <NavigationContainer
          theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: COLORS.bg } }}
          documentTitle={{ formatter: () => 'ROXGO' }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {!session ? (
              <Stack.Screen name="Login" component={Login} />
            ) : !athlete ? (
              // Primeiro acesso: sem registro em athletes
              <Stack.Screen name="Onboarding" component={Onboarding} />
            ) : (
              <Stack.Screen name="Tabs" component={Tabs} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AthleteContext.Provider>
    </SafeAreaProvider>
  )
}
