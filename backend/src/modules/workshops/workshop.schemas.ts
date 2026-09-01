import { z } from "zod";

export const workshopParamsSchema = z.object({
  id: z.string().uuid("Identificador de oficina inválido"),
});

export const createWorkshopSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(1000),
  startsAt: z.coerce.date().refine((date) => date > new Date(), {
    message: "A data da oficina deve estar no futuro",
  }),
  durationMin: z.coerce.number().int().min(30).max(1440),
  capacity: z.coerce.number().int().min(1).max(500),
  location: z.string().trim().min(3).max(160),
});

export const updateWorkshopSchema = createWorkshopSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;


