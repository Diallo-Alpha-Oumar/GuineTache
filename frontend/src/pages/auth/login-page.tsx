import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, LogIn, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldLabel } from '@/components/auth/field-label'
import { PasswordInput } from '@/components/auth/password-input'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormValues } from '@/utils/validation'
import { cn } from '@/lib/utils'

const DEMO_ACCOUNTS = {
  ADMIN: { email: 'admin@guinetache.com', password: 'Admin123!' },
  USER: { email: 'user@guinetache.com', password: 'User123!' },
} as const

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  function fillDemoAccount(role: keyof typeof DEMO_ACCOUNTS) {
    const account = DEMO_ACCOUNTS[role]
    setValue('email', account.email, { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const result = await login(values)
    if (!result.success) {
      setServerError(result.message ?? 'Une erreur est survenue.')
      return
    }
    toast.success('Connexion réussie', { description: 'Ravi de vous revoir !' })
    const redirectTo = (location.state as { from?: string } | null)?.from
    const fallback = result.user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
    navigate(redirectTo ?? fallback, { replace: true })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider uppercase"
          style={{ backgroundColor: 'color-mix(in oklab, var(--brand-green) 15%, transparent)', color: 'var(--brand-green)' }}
        >
          <Sparkles className="size-3" />
          Espace de travail
        </span>
        <h1 className="text-3xl font-bold text-foreground">Bienvenue</h1>
        <p className="text-muted-foreground">Connectez-vous pour accéder à votre espace de travail.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {serverError && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
              className="pl-9"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <PasswordInput id="password" placeholder="••••••••" autoComplete="current-password" {...register('password')} aria-invalid={!!errors.password} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox className="checkbox-brand-accent" />
            <span className="text-sm text-muted-foreground">Se souvenir de moi</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full text-primary-foreground shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]',
          )}
          style={{ background: 'linear-gradient(90deg, var(--brand-red) 0%, color-mix(in oklab, var(--brand-red) 70%, var(--brand-yellow)) 100%)' }}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          Se connecter
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            S'inscrire
          </Link>
        </p>

        <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
          <p className="text-center font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Connexion rapide (démo)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="transition-colors hover:border-foreground/30"
              onClick={() => fillDemoAccount('ADMIN')}
            >
              <ShieldCheck />
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="transition-colors hover:border-foreground/30"
              onClick={() => fillDemoAccount('USER')}
            >
              <UserRound />
              Utilisateur
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
