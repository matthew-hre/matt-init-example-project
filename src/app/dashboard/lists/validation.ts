import { z } from "zod";

export const createGameListSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(40, "List name must be less than 40 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
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

export type CreateGameListInput = z.infer<typeof createGameListSchema>;
