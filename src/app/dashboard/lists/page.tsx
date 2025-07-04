import { Button } from "~/components/ui/button";

import CreateGameDialog from "./create-game-dialgog";

type GameList = {
  id: number;
  name: string;
  description: string;
  tags: string;
  games: Game[];
};

type Game = {
  id: number;
  name: string;
  url: string;
};

const mockGameLists: GameList[] = [
  {
    id: 1,
    name: "Movie Games",
    description: "My daily collection of movie-based games",
    tags: "movies",
    games: [
      { id: 1, name: "Movie Grid", url: "https://moviegrid.io/" },
      { id: 2, name: "Box Office Game", url: "https://boxofficega.me/" },
    ],
  },
];

async function createGameList(
  formData: FormData,
) {
  "use server";

  console.log("Creating game list with data:", formData);
}

export default function DashboardListsPage() {
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
          {mockGameLists.map(list => (
            <GameListCard list={list} key={list.id} />
          ))}
        </div>

        {mockGameLists.length === 0 && (
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
          {list.description}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {list.tags.split(",").map(tag => (
            <span
              key={`${list.id}-${tag.trim()}`}
              className={`
                bg-secondary text-secondary-foreground rounded-full px-2 py-1
                text-xs
              `}
            >
              {tag.trim()}
            </span>
          ))}
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
                {game.url}
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
