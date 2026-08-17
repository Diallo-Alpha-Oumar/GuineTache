import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, KeyRound, Loader2, MailQuestion } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/auth/otp-input'
import { FieldLabel } from '@/components/auth/field-label'
import { PasswordInput } from '@/components/auth/password-input'
import { authService } from '@/services/auth.service'
import { forgotPasswordEmailSchema, resetPasswordSchema } from '@/utils/validation'
import { z } from 'zod'

type EmailFormValues = z.infer<typeof forgotPasswordEmailSchema>
type ResetFormValues = z.infer<typeof resetPasswordSchema>

type Step = 'EMAIL' | 'OTP' | 'RESET'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('EMAIL')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(forgotPasswordEmailSchema) })
  const resetForm = useForm<ResetFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmitEmail(values: EmailFormValues) {
    setServerError(null)
    const result = await authService.requestPasswordReset(values.email)
    if (!result.success) {
      setServerError(result.message ?? 'Une erreur est survenue.')
      return
    }
    setEmail(values.email)
    toast.success('Code envoyé', { description: `Un code a été envoyé à ${values.email}.` })
    setStep('OTP')
  }

  function handleVerifyOtp() {
    if (code.length !== 6) {
      setOtpError('Veuillez saisir les 6 chiffres du code.')
      return
    }
    setOtpError(null)
    setStep('RESET')
  }

  async function onSubmitReset(values: ResetFormValues) {
    setServerError(null)
    const result = await authService.resetPassword(code, values.password)
    if (!result.success) {
      setServerError(result.message ?? 'Une erreur est survenue.')
      setStep('OTP')
      return
    }
    toast.success('Mot de passe réinitialisé', { description: 'Vous pouvez maintenant vous connecter.' })
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {step === 'RESET' ? <KeyRound className="size-6" /> : <MailQuestion className="size-6" />}
        </div>
        <h1 className="text-3xl font-bold text-foreground">Mot de passe oublié</h1>
        <p className="text-muted-foreground">
          {step === 'EMAIL' && 'Saisissez votre email pour recevoir un code de réinitialisation'}
          {step === 'OTP' && (
            <>
              Un code a été envoyé à <span className="font-medium text-foreground">{email}</span>
            </>
          )}
          {step === 'RESET' && 'Choisissez un nouveau mot de passe'}
        </p>
      </div>

      <div className="space-y-4">
        {serverError && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        {step === 'EMAIL' && (
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="votre@email.com" {...emailForm.register('email')} aria-invalid={!!emailForm.formState.errors.email} />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <MailQuestion />}
              Envoyer le code
            </Button>
          </form>
        )}

        {step === 'OTP' && (
          <div className="space-y-6">
            <OtpInput value={code} onChange={setCode} />
            {otpError && <p className="text-center text-sm text-destructive">{otpError}</p>}
            <Button className="w-full" onClick={handleVerifyOtp}>
              Vérifier le code
            </Button>
          </div>
        )}

        {step === 'RESET' && (
          <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
              <PasswordInput id="password" placeholder="••••••••" {...resetForm.register('password')} aria-invalid={!!resetForm.formState.errors.password} />
              {resetForm.formState.errors.password && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
              <PasswordInput id="confirmPassword" placeholder="••••••••" {...resetForm.register('confirmPassword')} aria-invalid={!!resetForm.formState.errors.confirmPassword} />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
              {resetForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />}
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
