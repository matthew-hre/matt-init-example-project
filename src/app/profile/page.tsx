import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";

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

  if (!session?.user)
    return;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  await db
    .update(user)
    .set({
      name,
      email,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  revalidatePath("/profile");
}

export default async function ProfilePage() {
  const headersList = await headers();
  const session = (await auth.api.getSession({ headers: headersList }))!;

  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id));

  return (
    <div className={`
      flex h-screen flex-col items-center justify-center space-y-8
    `}
    >
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
        <button
          type="submit"
          className={`
            rounded bg-black px-4 py-2 text-white
            hover:bg-gray-800
          `}
        >
          Update Profile
        </button>
      </form>

      <button
        type="button"
        onClick={signOut}
        className={`
          mt-4 flex h-12 items-center justify-center rounded-full border px-5
          text-sm font-medium transition
          hover:bg-[#f2f2f2]
          dark:hover:bg-[#1a1a1a]
        `}
      >
        Sign Out
      </button>
    </div>
  );
}
