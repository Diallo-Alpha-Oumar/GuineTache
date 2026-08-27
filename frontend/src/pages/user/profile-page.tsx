import { Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountProfileTab } from '@/components/account/account-profile-tab'
import { AccountSecurityTab } from '@/components/account/account-security-tab'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'

function PreferencesTab() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisissez le thème d'affichage de l'application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
            }`}
          >
            <Sun className="size-5" />
            <div>
              <p className="text-sm font-medium">Clair</p>
              <p className="text-xs text-muted-foreground">Thème lumineux</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
            }`}
          >
            <Moon className="size-5" />
            <div>
              <p className="text-sm font-medium">Sombre</p>
              <p className="text-xs text-muted-foreground">Thème sombre</p>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérez votre profil, votre sécurité et vos préférences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Mon profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AccountProfileTab />
        </TabsContent>
        <TabsContent value="security">
          <AccountSecurityTab />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
