import { z } from "zod";

export const workshopParamsSchema = z.object({
  id: z.string().uuid("Identificador de oficina inválido"),
});

export const createWorkshopSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    category: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(1000),
    imageUrl: z.string().trim().url().max(2048).nullable().optional(),
    materials: z.array(z.string().trim().min(2).max(120)).max(20).optional(),
    startsAt: z.coerce.date().refine((date) => date > new Date(), {
      message: "A data da oficina deve estar no futuro",
    }),
    durationMin: z.coerce.number().int().min(30).max(1440),
    capacity: z.coerce.number().int().min(1).max(500),
    location: z.string().trim().min(3).max(160),
  })
  .strict();

export const listWorkshopsQuerySchema = z
  .object({
    active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export const updateWorkshopSchema = createWorkshopSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Informe ao menos um campo para atualizar" },
);

export const updateWorkshopStatusSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type ListWorkshopsQuery = z.infer<typeof listWorkshopsQuerySchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type UpdateWorkshopStatusInput = z.infer<typeof updateWorkshopStatusSchema>;
