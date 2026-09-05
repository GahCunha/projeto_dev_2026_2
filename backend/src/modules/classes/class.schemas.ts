import { z } from "zod";

export const classParamsSchema = z.object({
  id: z.string().uuid("Identificador de turma inválido"),
});

export const workshopClassParamsSchema = z.object({
  workshopId: z.string().uuid("Identificador de oficina inválido"),
});

const meetingSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    location: z.string().trim().min(3).max(160),
  })
  .strict()
  .refine(({ startsAt, endsAt }) => endsAt > startsAt, {
    message: "O término da aula deve ocorrer depois do início",
    path: ["endsAt"],
  });

export const createClassSchema = z
  .object({
    name: z.string().trim().min(3).max(100),
    capacity: z.coerce.number().int().min(1).max(500),
    price: z.coerce.number().min(0).max(100_000).multipleOf(0.01),
    active: z.boolean().optional(),
    meetings: z.array(meetingSchema).min(1).max(60),
  })
  .strict();

export const updateClassSchema = createClassSchema
  .omit({ meetings: true })
  .extend({ meetings: z.array(meetingSchema).min(1).max(60).optional() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const updateClassStatusSchema = z.object({ active: z.boolean() }).strict();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
