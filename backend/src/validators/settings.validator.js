const { z } = require('zod');

const updateSettingsSchema = {
  body: z
    .object({
      registrationOpen: z.boolean().optional(),
      maintenanceMode: z.boolean().optional(),
      maintenanceMessage: z
        .string()
        .trim()
        .max(300, 'Le message de maintenance ne peut pas dépasser 300 caractères')
        .optional(),
      notifications: z
        .object({
          taskAssigned: z.boolean().optional(),
          taskUpdated: z.boolean().optional(),
          taskCompleted: z.boolean().optional(),
          taskOverdue: z.boolean().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
};

module.exports = { updateSettingsSchema };
