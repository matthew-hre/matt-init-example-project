import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import type { game } from "~/lib/db/schema";

import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { gameList } from "~/lib/db/schema";

import CreateGameDialog from "./create-game-dialgog";
import { createGameListSchema } from "./validation";

type GameList = typeof gameList.$inferSelect & {
  games: Array<Pick<typeof game.$inferSelect, "id" | "name" | "url">>;
};

async function createGameList(
  formData: FormData,
) {
  "use server";

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    tags: formData.get("tags") as string,
  };

  const result = createGameListSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.format();
    const errorMessage = Object.values(errors)
      .filter(error => typeof error === "object" && "_errors" in error)
      .map(error => (error as any)._errors[0])
      .join(", ");
    throw new Error(errorMessage || "Invalid form data");
  }

  const { name, description, tags } = result.data;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to create a game list");
  }

  const userId = session.user.id;
  try {
    await db.insert(gameList).values({
      name,
      description,
      tags,
      userId,
    });
  }
  catch (error) {
    console.error("Error creating game list:", error);
    throw new Error("Failed to create game list");
  }

  revalidatePath("/dashboard/lists");
}

async function getGameLists() {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to view game lists");
  }

  const userId = session.user.id;

  const lists = await db.query.gameList.findMany({
    where: (gameList, { eq }) => eq(gameList.userId, userId),
    with: {
      games: {
        columns: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
  });

  return lists;
}

export default async function DashboardListsPage() {
  const gameLists = await getGameLists();

  return (
    <div className="bg-background text-primary p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Your Game Lists</h1>
            <p className="text-muted-foreground">
              Organize your favorite games
            </p>
          </div>
          <CreateGameDialog
            onCreate={createGameList}
          />
        </div>

        <div
          className={`
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {gameLists.map(list => (
            <GameListCard list={list} key={list.id} />
          ))}
        </div>

        {gameLists.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No game lists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first game list to get started organizing your favorite games
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GameListCard({ list }: { list: GameList }) {
  return (
    <div
      key={list.id}
      className={`
        bg-card border-border space-y-4 rounded-lg border p-6 transition-shadow
        hover:shadow-md
      `}
    >
      <div>
        <h3 className="mb-2 text-xl font-semibold">{list.name}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {list.description || "No description provided"}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {list.tags?.split(",").map(tag => (
            <span
              key={`${list.id}-${tag.trim()}`}
              className={`
                bg-secondary text-secondary-foreground rounded-full px-2 py-1
                text-xs
              `}
            >
              {tag.trim()}
            </span>
          )) || <span className="text-muted-foreground text-xs">No tags</span>}
        </div>
      </div>

      <div>
        <h4 className="text-muted-foreground mb-2 text-sm font-medium">
          Games (
          {list.games.length}
          )
        </h4>
        <div className="space-y-2">
          {list.games.slice(0, 3).map(game => (
            <div
              key={game.id}
              className={`
                border-b pb-2
                last:border-b-0
              `}
            >
              <div className="text-sm font-medium">{game.name}</div>
              <div className="text-muted-foreground truncate text-xs">
                {game.url || "No URL provided"}
              </div>
            </div>
          ))}
          {list.games.length > 3 && (
            <div className="text-muted-foreground text-xs">
              +
              {list.games.length - 3}
              {" "}
              more games
            </div>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full text-sm"
      >
        View List
      </Button>
    </div>
  );
}
