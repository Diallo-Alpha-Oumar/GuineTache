import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLabel } from '@/components/auth/field-label'
import { PasswordInput } from '@/components/auth/password-input'
import { authService } from '@/services/auth.service'
import { registerSchema, type RegisterFormValues } from '@/utils/validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    const result = await authService.register(values)
    if (!result.success) {
      setServerError(result.message ?? 'Une erreur est survenue.')
      return
    }
    toast.success('Code de vérification envoyé', {
      description: `Un email a été envoyé à ${values.email}.`,
    })
    navigate('/verify-otp', { state: { email: values.email, purpose: 'REGISTER' } })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Créer un compte</h1>
        <p className="text-muted-foreground">Commencez à organiser vos tâches dès aujourd'hui.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <FieldLabel htmlFor="fullName">Nom complet</FieldLabel>
          <Input id="fullName" placeholder="Mamadou Bah" autoComplete="name" {...register('fullName')} aria-invalid={!!errors.fullName} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="votre@email.com" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <PasswordInput id="password" placeholder="••••••••" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
          <PasswordInput id="confirmPassword" placeholder="••••••••" autoComplete="new-password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="acceptTerms"
              className="checkbox-brand-accent mt-0.5"
              checked={watch('acceptTerms') === true}
              onCheckedChange={(checked) => setValue('acceptTerms', (checked === true) as true, { shouldValidate: true })}
            />
            <Label htmlFor="acceptTerms" className="font-normal text-muted-foreground">
              J'accepte les conditions d'utilisation et la politique de confidentialité
            </Label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Créer mon compte
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}
