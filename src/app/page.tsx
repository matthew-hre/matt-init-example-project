import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "~/lib/auth";

export default async function Home() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return (
    <div className={`
      grid min-h-screen grid-rows-[20px_1fr_20px] items-center
      justify-items-center gap-16 p-8 pb-20 font-sans
      sm:p-20
    `}
    >
      <main className={`
        row-start-2 flex flex-col items-center gap-[32px]
        sm:items-start
      `}
      >
        <ol className={`
          mx-auto list-inside list-decimal text-center font-mono text-sm/8
          sm:text-left
        `}
        >
          <li className="mb-4">
            Get started by
            {" "}
            <Link
              href="/signup"
              className={`
                font-medium underline transition-colors
                hover:text-[#1a1a1a]
                dark:hover:text-[#ccc]
              `}
            >
              signing up
            </Link>
            .
          </li>
          <li>
            Or by
            {" "}
            <Link
              href="/signin"
              className={`
                font-medium underline transition-colors
                hover:text-[#1a1a1a]
                dark:hover:text-[#ccc]
              `}
            >
              logging in
            </Link>
            {" "}
            if you already have an account.
          </li>
          {session && (
            <li className="mt-4">
              Finally, navigate to the protected
              {" "}
              <Link
                href="/dashboard"
                className={`
                  font-medium underline transition-colors
                  hover:text-[#1a1a1a]
                  dark:hover:text-[#ccc]
                `}
              >
                /dashboard
              </Link>
              {" "}
              route!
            </li>
          )}

        </ol>
      </main>
    </div>
  );
}
