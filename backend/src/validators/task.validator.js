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

const taskIdParamsSchema = {
  params: z
    .object({
      id: objectIdSchema('L’identifiant de la tâche'),
    })
    .strict(),
};

const updateTaskSchema = {
  params: taskIdParamsSchema.params,
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, 'Le titre doit contenir au moins 3 caractères')
        .max(150, 'Le titre ne peut pas dépasser 150 caractères')
        .optional(),
      description: z
        .string()
        .trim()
        .max(2000, 'La description ne peut pas dépasser 2000 caractères')
        .optional(),
      status: z.enum(['todo', 'in_progress', 'cancelled', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      dueDate: z
        .string()
        .datetime({ message: 'La date d’échéance doit être une date ISO valide' })
        .optional()
        .nullable(),
      assignedTo: objectIdSchema('L’identifiant de l’utilisateur assigné').optional().nullable(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Aucune donnée à mettre à jour.',
    }),
};

const listTasksSchema = {
  query: z
    .object({
      status: z.enum(['todo', 'in_progress', 'cancelled', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      search: z.string().trim().max(150).optional(),
      assignedTo: objectIdSchema('L’identifiant de l’utilisateur assigné').optional(),
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    })
    .strict(),
};

module.exports = { createTaskSchema, updateTaskSchema, taskIdParamsSchema, listTasksSchema };
