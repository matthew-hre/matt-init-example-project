import { z } from "zod";

export const createGameSchema = z.object({
  name: z
    .string()
    .min(1, "Game name is required")
    .max(100, "Game name must be less than 100 characters")
    .trim(),
  url: z
    .string()
    .url("A valid URL is required"),
  siteName: z
    .string()
    .min(1, "Site name is required")
    .max(50, "Site name must be less than 50 characters")
    .trim(),
  tags: z
    .string()
    .min(1, "At least one tag is required")
    .refine(
      (tags) => {
        const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
        return tagArray.length > 0;
      },
      { message: "At least one valid tag is required" },
    )
    .refine(
      (tags) => {
        const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
        return tagArray.every(tag => tag.length <= 50);
      },
      { message: "Each tag must be less than 50 characters" },
    )
    .refine(
      (tags) => {
        const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
        return tagArray.length <= 10;
      },
      { message: "Maximum 10 tags allowed" },
    ),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
