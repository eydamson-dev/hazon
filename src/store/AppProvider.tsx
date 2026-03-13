import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../../tamagui.config'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {children}
    </TamaguiProvider>
  )
}
