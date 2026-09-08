import { z } from "zod";

export const loginPreflightSchema = z
  .object({
    id: z.string().trim().min(1).max(255),
    password: z.string().min(1).max(500),
  })
  .strict();

export const emailRequestSchema = z
  .object({
    email: z.string().trim().email().max(255),
  })
  .strict();

export const emailOtpSchema = emailRequestSchema
  .extend({
    code: z.string().trim().regex(/^\d{6}$/),
  })
  .strict();

export const accountEmailOtpSchema = emailOtpSchema
  .extend({
    id: z.string().trim().min(1).max(255),
  })
  .strict();
