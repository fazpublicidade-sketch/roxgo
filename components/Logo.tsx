import { Image } from 'react-native'

// Proporção do arquivo (800x357). Letras GO vazadas (transparentes) sobre as barras.
const RATIO = 800 / 357

export default function Logo({ width }: { width: number }) {
  return (
    <Image
      source={require('../assets/logo_roxgo.png')}
      style={{ width, height: width / RATIO }}
      resizeMode="contain"
    />
  )
}
