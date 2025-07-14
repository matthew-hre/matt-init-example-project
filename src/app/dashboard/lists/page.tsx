import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";

import type { game } from "~/lib/db/schema";

import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { gameList } from "~/lib/db/schema";

import CreateGameDialog from "./create-game-dialog";
import EditGameDialog from "./edit-game-dialog";
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
    orderBy: (gameList, { desc }) => desc(gameList.updatedAt),
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
            lg:grid-cols-2
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
        bg-card border-border relative space-y-4 rounded-lg border p-6
        transition-shadow
        hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-semibold">{list.name}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {list.description || "No description provided"}
          </p>
        </div>
        <EditGameDialog
          list={list}
          onEdit={editGameList}
          onDelete={deleteGameList}
        />
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
        asChild
      >
        <Link href={`/dashboard/lists/${list.id}`}>
          View List
        </Link>
      </Button>
      <span className="text-muted-foreground font-mono text-xs">
        {
          list.createdAt
            ? `Created ${new Date(list.createdAt).toLocaleDateString()}`
            : "No creation date"
        }
        {list.updatedAt
          && (
            `, Last updated: ${new Date(list.updatedAt).toLocaleDateString()}`
          )}
      </span>
    </div>
  );
}

async function editGameList(
  formData: FormData,
) {
  "use server";

  const rawData = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    tags: formData.get("tags") as string,
  };

  const idNumber = Number.parseInt(rawData.id);
  if (Number.isNaN(idNumber)) {
    throw new TypeError("Invalid list ID");
  }

  const result = createGameListSchema.safeParse({
    name: rawData.name,
    description: rawData.description,
    tags: rawData.tags,
  });

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
    throw new Error("You must be signed in to edit a game list");
  }

  const userId = session.user.id;

  try {
    const existingList = await db.query.gameList.findFirst({
      where: (gameList, { eq, and }) => and(
        eq(gameList.id, idNumber),
        eq(gameList.userId, userId),
      ),
    });

    if (!existingList) {
      throw new Error("Game list not found or you don't have permission to edit it");
    }

    await db.update(gameList)
      .set({
        name,
        description,
        tags,
        updatedAt: new Date(),
      })
      .where(eq(gameList.id, idNumber));
  }
  catch (error) {
    console.error("Error updating game list:", error);
    throw new Error("Failed to update game list");
  }

  revalidatePath("/dashboard/lists");
}

async function deleteGameList(listId: number) {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete a game list");
  }

  const userId = session.user.id;

  try {
    const existingList = await db.query.gameList.findFirst({
      where: (gameList, { eq, and }) => and(
        eq(gameList.id, listId),
        eq(gameList.userId, userId),
      ),
    });

    if (!existingList) {
      throw new Error("Game list not found or you don't have permission to delete it");
    }

    await db.delete(gameList).where(eq(gameList.id, listId));
  }
  catch (error) {
    console.error("Error deleting game list:", error);
    throw new Error("Failed to delete game list");
  }

  revalidatePath("/dashboard/lists");
}
