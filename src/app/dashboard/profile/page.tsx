import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { user } from "~/lib/db/schema";

import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic"; // ✅ always dynamic

export default async function ProfilePage() {
  const headersList = await headers(); // Await headers() to get the Headers instance

  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    return <p className="mt-10 text-center text-red-600">Error: User not found.</p>;
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser) {
    return <p className="mt-10 text-center text-red-600">Error: User not found.</p>;
  }

  return <ProfileClient currentUser={dbUser} />;
}
