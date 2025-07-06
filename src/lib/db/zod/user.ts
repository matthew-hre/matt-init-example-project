import { z } from "zod";

// ✅ Allowed domains (no @ symbol)
const allowedDomains = ["mtroyal.ca", "gmail.com", "yahoo.ca", "outlook.com"];

export const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required"),

  email: z
    .string()
    .email("Invalid email format")
    .refine((email) => {
      const domain = email.split("@")[1];
      return allowedDomains.includes(domain);
    }, {
      message: "Email domain must be one of mtroyal.ca, gmail.com, yahoo.ca, or outlook.com",
    }),
});

export type UserInput = z.infer<typeof userSchema>;
