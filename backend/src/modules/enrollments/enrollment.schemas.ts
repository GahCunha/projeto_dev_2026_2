import { z } from "zod";

export const createEnrollmentSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    workshopId: z.string().uuid("Identificador de oficina inválido"),
  })
  .strict();

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
