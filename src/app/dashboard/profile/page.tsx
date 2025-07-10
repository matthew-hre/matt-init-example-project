import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";
import { userSchema } from "~/lib/validation/user";

async function signOut() {
  "use server";

  const headersList = await headers();
  await auth.api.signOut({ headers: headersList });
  redirect("/");
}

async function updateUserProfile(formData: FormData) {
  "use server";

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    redirect("/");
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  };

  const parsed = userSchema.safeParse(raw);

  if (!parsed.success) {
    const formattedErrors = parsed.error.format();

    const errorMessages = [
      ...(formattedErrors.email?._errors || []),
      ...(formattedErrors.name?._errors || []),
    ];

    const combinedMessage = errorMessages.length > 0
      ? errorMessages.join(" | ")
      : "Invalid input";

    redirect(`/dashboard/profile?error=${encodeURIComponent(combinedMessage)}`);
  }

  const { name, email } = parsed.data;

  await db
    .update(user)
    .set({
      name,
      email,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/dashboard/profile");
}

export default async function ProfilePage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({ headers: headersList }))!;

  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id));

  return (
    <div
      className={`
        flex h-screen flex-col items-center justify-center space-y-8
      `}
    >
      {currentUser.image && (
        <img
          src={currentUser.image}
          alt="GitHub Avatar"
          className="w-24 h-24 rounded-full border mb-4"
        />
      )}

      <p className="font-sans">
        Hey
        {" "}
        <span className="font-bold">{currentUser.name}</span>
        , welcome to your
        profile!
      </p>

      <form
        action={updateUserProfile}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          defaultValue={currentUser.name}
          className="rounded border px-3 py-2"
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          defaultValue={currentUser.email}
          className="rounded border px-3 py-2"
          placeholder="Email"
          required
        />
        <Button type="submit">
          Update Profile
        </Button>
      </form>

      <Button
        type="button"
        onClick={signOut}
        variant="outline"
        size="lg"
        className="mt-4"
      >
        Sign Out
      </Button>
    </div>
  );
}
