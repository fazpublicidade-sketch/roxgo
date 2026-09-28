import { Image } from 'react-native'

// Proporção do arquivo (900x301). GO recortado (transparente) dentro do badge.
const RATIO = 900 / 301

export default function Logo({ width }: { width: number }) {
  return (
    <Image
      source={require('../assets/logo_roxgo.png')}
      style={{ width, height: width / RATIO }}
      resizeMode="contain"
    />
  )
}
