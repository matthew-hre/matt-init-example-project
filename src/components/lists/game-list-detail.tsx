"use client";

import type { DragEndEvent } from "@dnd-kit/core";

import {
  closestCenter,
  DndContext,

  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { game, gameList } from "~/lib/db/schema";

import { Button } from "~/components/ui/button";

import { AddGameDialog } from "./add-game-dialog";
import { EditGameDialog } from "./edit-game-dialog";

type Game = typeof game.$inferSelect;
type GameList = typeof gameList.$inferSelect & {
  games: Game[];
};

type GameListDetailProps = {
  gameList: GameList;
  addGameAction: (formData: FormData) => Promise<void>;
  updateGameAction: (formData: FormData) => Promise<void>;
  deleteGameAction: (gameId: number, listId: number) => Promise<void>;
  reorderGamesAction: (gameOrders: { id: number; orderIndex: number }[], listId: number) => Promise<void>;
};

function SortableGameItem({ game, updateGameAction, deleteGameAction }: {
  game: Game;
  updateGameAction: (formData: FormData) => Promise<void>;
  deleteGameAction: (gameId: number, listId: number) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGameAction(game.id, game.listId!);
    }
    catch (error) {
      console.error("Failed to delete game:", error);
    }
    finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-card border-border group flex items-center gap-4 rounded-lg border
        p-4 transition-shadow
        hover:shadow-md
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className={`
          text-muted-foreground cursor-grab
          active:cursor-grabbing
        `}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{game.name}</h3>
              {game.url && (
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    text-muted-foreground transition-colors
                    hover:text-primary
                  `}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="group/siteinfo relative h-5 overflow-hidden">
              <p
                className={`
                  text-muted-foreground text-sm transition-transform
                  duration-300
                  ${game.url ? "group-hover/siteinfo:-translate-y-6" : ""}
                `}
              >
                {game.siteName}
              </p>
              {game.url && (
                <p
                  className={`
                    text-muted-foreground absolute top-0 left-0 w-full
                    translate-y-6 truncate text-sm transition-transform
                    duration-300
                    group-hover/siteinfo:translate-y-0
                  `}
                >
                  {game.url}
                </p>
              )}
            </div>
            {game.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {game.tags.split(",").map(tag => (
                  <span
                    key={`${game.id}-${tag.trim()}`}
                    className={`
                      bg-secondary text-secondary-foreground rounded px-2 py-1
                      text-xs
                    `}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={`
            flex gap-2 opacity-0 transition-opacity
            group-hover:opacity-100
          `}
          >
            <EditGameDialog game={game} updateGameAction={updateGameAction} />

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameListDetail({
  gameList,
  addGameAction,
  updateGameAction,
  deleteGameAction,
  reorderGamesAction,
}: GameListDetailProps) {
  const [games, setGames] = useState<Game[]>(gameList.games);
  const prevGameListRef = useRef(gameList.games);

  useEffect(() => {
    if (prevGameListRef.current !== gameList.games) {
      // disabling this rule here, it's a bit too strict. usually we want to protect against unconditional state updates
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setGames(gameList.games);
      prevGameListRef.current = gameList.games;
    }
  }, [gameList.games]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = games.findIndex(game => game.id === active.id);
      const newIndex = games.findIndex(game => game.id === over.id);

      const newGames = arrayMove(games, oldIndex, newIndex);
      setGames(newGames);

      const gameOrders = newGames.map((game, index) => ({
        id: game.id,
        orderIndex: index + 1,
      }));

      reorderGamesAction(gameOrders, gameList.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Games (
            {games.length}
            )
          </h2>
          <p className="text-muted-foreground text-sm">
            Drag and drop to reorder games
          </p>
        </div>
        <AddGameDialog listId={gameList.id} addGameAction={addGameAction} />
      </div>

      {games.length === 0
        ? (
            <div className={`
              bg-card border-border rounded-lg border p-8 text-center
            `}
            >
              <h3 className="mb-2 text-lg font-semibold">No games yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first game to get started organizing this list
              </p>
              <AddGameDialog listId={gameList.id} addGameAction={addGameAction} />
            </div>
          )
        : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              id="game-list-dnd"
            >
              <SortableContext items={games} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {games.map(game => (
                    <SortableGameItem
                      key={game.id}
                      game={game}
                      updateGameAction={updateGameAction}
                      deleteGameAction={deleteGameAction}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
    </div>
  );
}
