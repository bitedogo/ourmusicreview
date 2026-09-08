import { z } from "zod";

export const updateMemberInputSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]),
  })
  .strict();

export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;
