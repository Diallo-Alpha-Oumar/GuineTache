const { z } = require('zod');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = (label) =>
  z.string({ required_error: `${label} est requis` }).regex(OBJECT_ID_REGEX, `${label} invalide`);

const createTaskSchema = {
  body: z
    .object({
      title: z
        .string({ required_error: 'Le titre est requis' })
        .trim()
        .min(3, 'Le titre doit contenir au moins 3 caractères')
        .max(150, 'Le titre ne peut pas dépasser 150 caractères'),
      description: z
        .string()
        .trim()
        .max(2000, 'La description ne peut pas dépasser 2000 caractères')
        .optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      dueDate: z
        .string()
        .datetime({ message: 'La date d’échéance doit être une date ISO valide' })
        .optional()
        .nullable(),
      assignedTo: objectIdSchema('L’identifiant de l’utilisateur assigné').optional().nullable(),
    })
    .strict(),
};

module.exports = { createTaskSchema };
