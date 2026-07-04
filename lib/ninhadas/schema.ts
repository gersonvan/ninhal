import { z } from "zod";

export const createNinhadaSchema = z.object({
  /** Se omitido, gerado automaticamente no formato AAAA-NN. */
  codNinhada: z.string().trim().min(1).optional(),
  anilhaMachoId: z.string().trim().min(1),
  anilhaFemeaId: z.string().trim().min(1),
  dataPostura: z.coerce.date(),
  ovosPrevistos: z.coerce.number().int().nonnegative().optional(),
  ovosBotados: z.coerce.number().int().nonnegative().optional(),
  ovosFerteis: z.coerce.number().int().nonnegative().optional(),
  filhotesNascidos: z.coerce.number().int().nonnegative().optional(),
});

export const updateNinhadaSchema = createNinhadaSchema.partial();

export type CreateNinhadaInput = z.infer<typeof createNinhadaSchema>;
export type UpdateNinhadaInput = z.infer<typeof updateNinhadaSchema>;
