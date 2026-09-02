import { EnrollmentStatus } from "@prisma/client";
import { z } from "zod";

export const createEnrollmentSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    workshopId: z.string().uuid("Identificador de oficina inválido"),
  })
  .strict();

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

export const listEnrollmentsQuerySchema = z
  .object({
    status: z.nativeEnum(EnrollmentStatus).optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;
