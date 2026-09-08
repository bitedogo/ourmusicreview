import { z } from "zod";

const playlistFields = {
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  isPublic: z.boolean().optional(),
  coverImageUrl: z.string().url().max(1000).nullable().optional(),
  genreIds: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
};

export const createPlaylistInputSchema = z.object(playlistFields).strict();

export const updatePlaylistInputSchema = z
  .object(playlistFields)
  .strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "수정할 내용을 입력해주세요.",
  });

export type CreatePlaylistInput = z.infer<typeof createPlaylistInputSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistInputSchema>;
