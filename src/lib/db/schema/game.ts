import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from ".";

export const gameList = pgTable("game_list", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags"),
  isPublic: boolean("isPublic").notNull().default(false),
  userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const game = pgTable("game", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  url: text("url"),
  siteName: text("siteName"),
  tags: text("tags"),
  orderIndex: integer("orderIndex"),
  listId: integer("listId").references(() => gameList.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const vote = pgTable("vote", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  isUp: boolean("isUp").notNull(),
  userId: uuid("userId").references(() => user.id, { onDelete: "cascade" }),
  listId: integer("listId").references(() => gameList.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const gameListRelations = relations(gameList, ({ many, one }) => ({
  games: many(game),
  user: one(user, {
    fields: [gameList.userId],
    references: [user.id],
  }),
}));

export const gameRelations = relations(game, ({ one }) => ({
  gameList: one(gameList, {
    fields: [game.listId],
    references: [gameList.id],
  }),
}));
