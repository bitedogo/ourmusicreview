import { z } from "zod";
import { RATING_MAX, RATING_MIN } from "@/src/lib/utils/rating";

const ratingSchema = z.number().finite().min(RATING_MIN).max(RATING_MAX);

export const createReviewInputSchema = z
  .object({
    albumId: z.string().trim().min(1).max(255),
    content: z.string().trim().min(1),
    rating: ratingSchema,
    albumTitle: z.string().trim().max(500).optional(),
    albumArtist: z.string().trim().max(500).optional(),
    albumImageUrl: z.string().url().max(2000).nullable().optional(),
    albumReleaseDate: z.string().trim().max(50).optional(),
    albumReleaseType: z.enum(["album", "single"]).optional(),
  })
  .strict();

export const updateReviewInputSchema = z
  .object({
    content: z.string().trim().min(1).optional(),
    rating: ratingSchema.optional(),
  })
  .strict()
  .refine((value) => value.content !== undefined || value.rating !== undefined, {
    message: "수정할 내용을 입력해주세요.",
  });

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;
