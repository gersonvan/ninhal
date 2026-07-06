import { z } from "zod";

export const createEspecieSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da espécie."),
});

export type CreateEspecieInput = z.infer<typeof createEspecieSchema>;
