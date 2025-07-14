import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import type { gameList } from "~/lib/db/schema";

import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { game } from "~/lib/db/schema";

import { GameListDetail } from "./game-list-detail";

type Game = typeof game.$inferSelect;
type GameList = typeof gameList.$inferSelect & {
  games: Game[];
};

async function getGameList(id: number): Promise<GameList | null> {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const list = await db.query.gameList.findFirst({
    where: (gameList, { eq, and }) => and(
      eq(gameList.id, id),
      eq(gameList.userId, session.user.id),
    ),
    with: {
      games: {
        orderBy: (game, { asc }) => asc(game.orderIndex),
      },
    },
  });

  return list || null;
}

async function addGame(formData: FormData) {
  "use server";

  const rawData = {
    listId: formData.get("listId") as string,
    name: formData.get("name") as string,
    url: formData.get("url") as string,
    siteName: formData.get("siteName") as string,
    tags: formData.get("tags") as string,
  };

  const listId = Number.parseInt(rawData.listId);
  if (Number.isNaN(listId)) {
    throw new TypeError("Invalid list ID");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to add games");
  }

  const existingList = await db.query.gameList.findFirst({
    where: (gameList, { eq, and }) => and(
      eq(gameList.id, listId),
      eq(gameList.userId, session.user.id),
    ),
  });

  if (!existingList) {
    throw new Error("Game list not found or you don't have permission");
  }

  const maxOrderIndex = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.listId, listId),
    orderBy: (game, { desc }) => desc(game.orderIndex),
  });

  const orderIndex = (maxOrderIndex?.orderIndex || 0) + 1;

  try {
    await db.insert(game).values({
      name: rawData.name,
      url: rawData.url || null,
      siteName: rawData.siteName || null,
      tags: rawData.tags || null,
      listId,
      orderIndex,
    });
  }
  catch (error) {
    console.error("Error adding game:", error);
    throw new Error("Failed to add game");
  }

  revalidatePath(`/dashboard/lists/${listId}`);
}

async function updateGame(formData: FormData) {
  "use server";

  const rawData = {
    id: formData.get("id") as string,
    listId: formData.get("listId") as string,
    name: formData.get("name") as string,
    url: formData.get("url") as string,
    siteName: formData.get("siteName") as string,
    tags: formData.get("tags") as string,
  };

  const gameId = Number.parseInt(rawData.id);
  const listId = Number.parseInt(rawData.listId);

  if (Number.isNaN(gameId) || Number.isNaN(listId)) {
    throw new TypeError("Invalid game or list ID");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update games");
  }

  const existingGame = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
    with: {
      gameList: true,
    },
  });

  if (!existingGame || existingGame.gameList?.userId !== session.user.id) {
    throw new Error("Game not found or you don't have permission");
  }

  try {
    await db.update(game)
      .set({
        name: rawData.name,
        url: rawData.url || null,
        siteName: rawData.siteName || null,
        tags: rawData.tags || null,
        updatedAt: new Date(),
      })
      .where(eq(game.id, gameId));
  }
  catch (error) {
    console.error("Error updating game:", error);
    throw new Error("Failed to update game");
  }

  revalidatePath(`/dashboard/lists/${listId}`);
}

async function deleteGame(gameId: number, listId: number) {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete games");
  }

  const existingGame = await db.query.game.findFirst({
    where: (game, { eq }) => eq(game.id, gameId),
    with: {
      gameList: true,
    },
  });

  if (!existingGame || existingGame.gameList?.userId !== session.user.id) {
    throw new Error("Game not found or you don't have permission");
  }

  try {
    await db.delete(game).where(eq(game.id, gameId));
  }
  catch (error) {
    console.error("Error deleting game:", error);
    throw new Error("Failed to delete game");
  }

  revalidatePath(`/dashboard/lists/${listId}`);
}

async function reorderGames(gameOrders: { id: number; orderIndex: number }[], listId: number) {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to reorder games");
  }

  const existingList = await db.query.gameList.findFirst({
    where: (gameList, { eq, and }) => and(
      eq(gameList.id, listId),
      eq(gameList.userId, session.user.id),
    ),
  });

  if (!existingList) {
    throw new Error("Game list not found or you don't have permission");
  }

  try {
    for (const gameOrder of gameOrders) {
      await db.update(game)
        .set({ orderIndex: gameOrder.orderIndex })
        .where(eq(game.id, gameOrder.id));
    }
  }
  catch (error) {
    console.error("Error reordering games:", error);
    throw new Error("Failed to reorder games");
  }

  revalidatePath(`/dashboard/lists/${listId}`);
}

export default async function GameListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listId = Number.parseInt(id);

  if (Number.isNaN(listId)) {
    notFound();
  }

  const gameListData = await getGameList(listId);

  if (!gameListData) {
    notFound();
  }

  return (
    <Suspense fallback={(
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )}
    >
      <div className="bg-background text-primary p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/lists"
            className="mb-4 inline-flex items-center"
          >
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lists
            </Button>
          </Link>
          <div className="mb-6 flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{gameListData.name}</h1>
              <p className="text-muted-foreground">
                {gameListData.description || "No description provided"}
              </p>
              {gameListData.tags && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {gameListData.tags.split(",").map(tag => (
                    <span
                      key={tag.trim()}
                      className={`
                        bg-secondary text-secondary-foreground rounded-full px-3
                        py-1 text-sm
                      `}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <GameListDetail
            gameList={gameListData}
            addGameAction={addGame}
            updateGameAction={updateGame}
            deleteGameAction={deleteGame}
            reorderGamesAction={reorderGames}
          />
        </div>
      </div>
    </Suspense>
  );
}
