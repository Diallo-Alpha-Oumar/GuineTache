import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, MailCheck, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/auth/otp-input'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/hooks/use-auth'

const RESEND_COOLDOWN_SECONDS = 30

interface LocationState {
  email?: string
  purpose?: 'REGISTER' | 'RESET_PASSWORD'
  onVerified?: string
}

export function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const state = (location.state as LocationState | null) ?? {}
  const email = state.email

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du code.')
      return
    }
    setError(null)
    setIsSubmitting(true)

    const result = await authService.verifyRegistrationOtp(code)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.message ?? 'Code invalide.')
      return
    }

    refreshUser()
    toast.success('Compte vérifié', { description: 'Bienvenue sur GuineeTache !' })
    navigate('/user/dashboard', { replace: true })
  }

  function handleResend() {
    void authService.resendOtp(state.purpose ?? 'REGISTER')
    setCooldown(RESEND_COOLDOWN_SECONDS)
    setCode('')
    toast.info('Code renvoyé', { description: `Un nouveau code a été envoyé à ${email}.` })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Vérification du code</h1>
        <p className="text-muted-foreground">
          Un code à 6 chiffres a été envoyé à <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <OtpInput value={code} onChange={setCode} disabled={isSubmitting} />

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button className="w-full" onClick={handleVerify} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          Vérifier
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {cooldown > 0 ? (
            <p>Renvoyer le code dans {cooldown}s</p>
          ) : (
            <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
              Renvoyer le code
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
