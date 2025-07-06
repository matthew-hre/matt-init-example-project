import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "~/lib/auth";

import GithubSigninButton from "./github-signin-button";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export default async function Header() {
  const headersList = await headers();

  // middleware is guarding this route, so this assertion is safe unless the middleware fails
  const session = (await auth.api.getSession({
    headers: headersList,
  }))!;

  return (
    <nav className={`
      bg-background/80 fixed top-0 flex w-full items-center justify-between p-4
      backdrop-blur-sm
    `}
    >
      <Link className="text-lg font-bold" href="/">-dles List</Link>
      <div className="flex items-center gap-4">
        {
          session
            ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                  >
                    <Link href="/dashboard">
                      View your Dashboard
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                  >
                    <Link href="/profile">
                      Profile
                    </Link>
                  </Button>
                </>
              )
            : (
                <GithubSigninButton />
              )
        }

        <ThemeToggle />
      </div>
    </nav>
  );
}
