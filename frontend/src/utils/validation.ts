import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
    email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    acceptTerms: z.literal(true, {
      error: () => "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export const taskSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().nullable(),
  assignedToId: z.string().nullable(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
