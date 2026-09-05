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
    workshopId: z.string().uuid("Identificador de oficina inválido").optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;

export const enrollmentParamsSchema = z.object({
  id: z.string().uuid("Identificador de inscrição inválido"),
});

export const updateEnrollmentStatusSchema = z
  .object({
    status: z.enum([EnrollmentStatus.CONFIRMADA, EnrollmentStatus.CANCELADA]),
  })
  .strict();

export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;

export const cancellationTokenParamsSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, "Token de cancelamento inválido"),
});
