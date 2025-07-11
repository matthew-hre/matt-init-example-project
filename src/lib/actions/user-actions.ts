"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { userSchema } from "~/lib/validation/user";

export async function updateUserProfile(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user)
    redirect("/");

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    image: formData.get("image") as string | null,
  };

  const parsed = userSchema.safeParse(raw);

  if (!parsed.success) {
    const formattedErrors = parsed.error.format();
    const errorMessages = [
      ...(formattedErrors.email?._errors || []),
      ...(formattedErrors.name?._errors || []),
    ];
    const combinedMessage
      = errorMessages.length > 0
        ? errorMessages.join(" | ")
        : "Invalid input";

    redirect(`/dashboard/profile?error=${encodeURIComponent(combinedMessage)}`);
  }

  const { name, email, image } = parsed.data;

  await db
    .update(user)
    .set({
      name,
      email,
      updatedAt: new Date(),
      ...(image && { image }),
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard/profile");
}

export async function signOut() {
  const headersList = await headers();
  await auth.api.signOut({ headers: headersList });
  redirect("/");
}
