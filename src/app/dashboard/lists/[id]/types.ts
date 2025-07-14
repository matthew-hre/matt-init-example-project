export type Game = {
  id: number;
  name: string;
  url: string | null;
  siteName: string | null;
  tags: string | null;
  orderIndex: number | null;
  listId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type GameList = {
  id: number;
  name: string;
  description: string | null;
  tags: string | null;
  games: Game[];
};
