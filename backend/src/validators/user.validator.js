const { z } = require('zod');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const nameSchema = (label) =>
  z
    .string()
    .trim()
    .min(2, `${label} doit contenir au moins 2 caractères`)
    .max(50, `${label} ne peut pas dépasser 50 caractères`);

const userIdParamsSchema = {
  params: z
    .object({
      id: z.string().regex(OBJECT_ID_REGEX, "L'identifiant utilisateur est invalide"),
    })
    .strict(),
};

const listUsersSchema = {
  query: z
    .object({
      search: z.string().trim().max(150).optional(),
      role: z.enum(['user', 'admin']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    })
    .strict(),
};

const updateUserSchema = {
  params: userIdParamsSchema.params,
  body: z
    .object({
      firstName: nameSchema('Le prénom').optional(),
      lastName: nameSchema('Le nom').optional(),
      email: z.string().trim().toLowerCase().email('Adresse e-mail invalide').optional(),
      role: z.enum(['user', 'admin']).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Aucune donnée à mettre à jour.',
    }),
};

module.exports = { userIdParamsSchema, listUsersSchema, updateUserSchema };
