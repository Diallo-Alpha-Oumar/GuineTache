// Service de simulation d'envoi d'emails. Aucun backend : les emails sont
// simplement journalisés en console pour la démonstration, et les écrans
// appelants affichent un toast à la place d'un vrai envoi.

function log(subject: string, to: string, body: string) {
  // eslint-disable-next-line no-console
  console.info(`[EMAIL SIMULÉ] À: ${to}\nSujet: ${subject}\n${body}\n`)
}

export const emailService = {
  sendOtpEmail(to: string, code: string): void {
    log('Votre code de vérification', to, `Votre code OTP est : ${code} (valide 5 minutes).`)
  },
  sendRegistrationConfirmation(to: string, fullName: string): void {
    log('Bienvenue sur GuineeTache', to, `Bonjour ${fullName}, votre compte a bien été créé.`)
  },
  sendTaskAssignedEmail(to: string, taskTitle: string): void {
    log('Nouvelle tâche assignée', to, `Une nouvelle tâche vous a été assignée : ${taskTitle}.`)
  },
  sendPasswordResetEmail(to: string, code: string): void {
    log('Réinitialisation de mot de passe', to, `Votre code de réinitialisation est : ${code}.`)
  },
}
