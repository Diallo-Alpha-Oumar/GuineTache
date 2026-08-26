const { z } = require('zod');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const notificationIdParamsSchema = {
  params: z
    .object({
      id: z
        .string({ required_error: "L'identifiant de la notification est requis" })
        .regex(OBJECT_ID_REGEX, "L'identifiant de la notification est invalide"),
    })
    .strict(),
};

const listNotificationsSchema = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      unreadOnly: z.coerce.boolean().optional(),
    })
    .strict(),
};

module.exports = { notificationIdParamsSchema, listNotificationsSchema };
