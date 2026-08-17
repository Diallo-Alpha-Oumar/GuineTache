import { DEMO_OTP_CODE } from '@/utils/constants'
import { emailService } from './email.service'
import { getItem, removeItem, setItem, STORAGE_KEYS } from '@/utils/storage'

interface OtpRecord {
  email: string
  code: string
  expiresAt: string
  purpose: 'REGISTER' | 'RESET_PASSWORD'
}

const OTP_TTL_MS = 5 * 60 * 1000

export const otpService = {
  // Le code est volontairement fixe (DEMO_OTP_CODE) pour permettre de tester
  // l'application sans backend réel d'envoi d'email.
  sendOtp(email: string, purpose: OtpRecord['purpose'] = 'REGISTER'): void {
    const record: OtpRecord = {
      email,
      code: DEMO_OTP_CODE,
      expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      purpose,
    }
    setItem(STORAGE_KEYS.otp, record)

    if (purpose === 'RESET_PASSWORD') {
      emailService.sendPasswordResetEmail(email, DEMO_OTP_CODE)
    } else {
      emailService.sendOtpEmail(email, DEMO_OTP_CODE)
    }
  },

  verifyOtp(email: string, code: string): { success: boolean; message: string } {
    const record = getItem<OtpRecord | null>(STORAGE_KEYS.otp, null)

    if (!record || record.email !== email) {
      return { success: false, message: "Aucun code n'a été envoyé à cette adresse." }
    }
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'Ce code a expiré, veuillez en demander un nouveau.' }
    }
    if (record.code !== code) {
      return { success: false, message: 'Code incorrect, veuillez réessayer.' }
    }

    removeItem(STORAGE_KEYS.otp)
    return { success: true, message: 'Code vérifié avec succès.' }
  },
}
