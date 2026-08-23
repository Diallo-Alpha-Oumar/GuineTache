import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ImagePlus, Loader2, Moon, Save, Sun, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { authService } from '@/services/auth.service'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from '@/utils/validation'
import { formatDate } from '@/utils/date'

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_MAX_SIZE = 2 * 1024 * 1024
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function AvatarUploader() {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  if (!user) return null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Utilisez une image JPEG, PNG ou WebP.')
      return
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error("L'image ne doit pas dépasser 2 Mo.")
      return
    }

    setIsUploading(true)
    const result = await authService.uploadAvatar(file)
    setIsUploading(false)

    if (result.success) {
      refreshUser()
      toast.success(result.message ?? 'Photo de profil mise à jour')
    } else {
      toast.error(result.message ?? "Impossible d'envoyer la photo.")
    }
  }

  async function handleRemove() {
    setIsRemoving(true)
    const result = await authService.removeAvatar()
    setIsRemoving(false)

    if (result.success) {
      refreshUser()
      toast.success(result.message ?? 'Photo de profil supprimée')
    } else {
      toast.error(result.message ?? 'Impossible de supprimer la photo.')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
        <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {user.avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
          {user.avatarUrl && (
            <Button type="button" variant="ghost" size="sm" disabled={isRemoving} onClick={handleRemove}>
              {isRemoving ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Supprimer
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP, 2 Mo maximum</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

function ProfileTab() {
  const { user, refreshUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '' },
  })

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    const result = await authService.updateProfile(values)
    if (result.success) {
      refreshUser()
      toast.success(result.message ?? 'Profil mis à jour avec succès')
    } else {
      toast.error(result.message ?? 'Impossible de mettre à jour le profil.')
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <AvatarUploader />
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Membre depuis le {formatDate(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Mettez à jour votre nom et votre adresse email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" {...register('fullName')} aria-invalid={!!errors.fullName} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function SecurityTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    const result = await authService.changePassword(values.currentPassword, values.newPassword)
    if (result.success) {
      toast.success(result.message ?? 'Mot de passe modifié avec succès.')
      reset()
    } else {
      toast.error(result.message ?? 'Impossible de modifier le mot de passe.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription>Utilisez un mot de passe fort que vous n'utilisez pas ailleurs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              aria-invalid={!!errors.currentPassword}
            />
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              aria-invalid={!!errors.newPassword}
            />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              {...register('confirmNewPassword')}
              aria-invalid={!!errors.confirmNewPassword}
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              Modifier le mot de passe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

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
          <ProfileTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
