import z from "zod";

export const emailSchema = z.object({
  email: z.email().max(100, "Email cannot exceed 100 characters."),
});
