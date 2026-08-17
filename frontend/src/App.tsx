import { ThemeProvider } from '@/context/theme-context'
import { AuthProvider } from '@/context/auth-context'
import { AppRouter } from '@/routes/app-router'
import { Toaster } from '@/components/ui/sonner'
import '@/data/db'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
