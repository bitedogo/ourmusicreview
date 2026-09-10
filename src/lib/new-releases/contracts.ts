import { z } from "zod";

const optionalCoverUrl = z
  .string()
  .trim()
  .max(1000)
  .nullable()
  .optional()
  .transform((value) => {
    if (!value) return null;
    return value;
  });

export const addItunesNewReleaseInputSchema = z
  .object({
    collectionId: z.string().trim().min(1).max(50),
  })
  .strict();

export const addManualNewReleaseInputSchema = z
  .object({
    source: z.literal("manual"),
    title: z.string().trim().min(1).max(500),
    artist: z.string().trim().min(1).max(255),
    releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    imageUrl: optionalCoverUrl,
  })
  .strict();

export const addNewReleaseInputSchema = z.union([
  addItunesNewReleaseInputSchema,
  addManualNewReleaseInputSchema,
]);

export const removeNewReleaseInputSchema = z
  .object({
    id: z.string().trim().uuid(),
  })
  .strict();

export type AddItunesNewReleaseInput = z.infer<typeof addItunesNewReleaseInputSchema>;
export type AddManualNewReleaseInput = z.infer<typeof addManualNewReleaseInputSchema>;
export type AddNewReleaseInput = z.infer<typeof addNewReleaseInputSchema>;
export type RemoveNewReleaseInput = z.infer<typeof removeNewReleaseInputSchema>;
