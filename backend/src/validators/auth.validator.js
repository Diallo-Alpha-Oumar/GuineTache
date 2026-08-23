const { z } = require('zod');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const nameSchema = (label) =>
  z
    .string({ required_error: `${label} est requis` })
    .trim()
    .min(2, `${label} doit contenir au moins 2 caractères`)
    .max(50, `${label} ne peut pas dépasser 50 caractères`);

const emailSchema = z
  .string({ required_error: "L'adresse e-mail est requise" })
  .trim()
  .toLowerCase()
  .email('Adresse e-mail invalide');

const passwordSchema = z
  .string({ required_error: 'Le mot de passe est requis' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(
    PASSWORD_REGEX,
    'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'
  );

const otpSchema = z
  .string({ required_error: 'Le code de vérification est requis' })
  .regex(/^\d{6}$/, 'Le code de vérification doit contenir exactement 6 chiffres');

const registerSchema = {
  body: z
    .object({
      firstName: nameSchema('Le prénom'),
      lastName: nameSchema('Le nom'),
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
};

const verifyEmailSchema = {
  body: z
    .object({
      email: emailSchema,
      otp: otpSchema,
    })
    .strict(),
};

const resendOtpSchema = {
  body: z
    .object({
      email: emailSchema,
    })
    .strict(),
};

const loginSchema = {
  body: z
    .object({
      email: emailSchema,
      password: z.string({ required_error: 'Le mot de passe est requis' }).min(1),
    })
    .strict(),
};

const forgotPasswordSchema = {
  body: z
    .object({
      email: emailSchema,
    })
    .strict(),
};

const resetPasswordSchema = {
  body: z
    .object({
      email: emailSchema,
      otp: otpSchema,
      newPassword: passwordSchema,
    })
    .strict(),
};

const changePasswordSchema = {
  body: z
    .object({
      currentPassword: z.string({ required_error: 'Le mot de passe actuel est requis' }).min(1),
      newPassword: passwordSchema,
    })
    .strict(),
};

const updateProfileSchema = {
  body: z
    .object({
      firstName: nameSchema('Le prénom').optional(),
      lastName: nameSchema('Le nom').optional(),
      email: emailSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Aucune donnée à mettre à jour.',
    }),
};

module.exports = {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};
