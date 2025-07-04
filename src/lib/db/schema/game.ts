import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from ".";

export const gameList = pgTable("game_list", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags"),
  isPublic: boolean("isPublic").notNull().default(false),
  userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),

});

export const game = pgTable("game", {

  id: integer("id").primaryKey().notNull(),
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

  id: integer("id").primaryKey().notNull(),
  isUp: boolean("isUp").notNull(),
  userId: uuid("userId").references(() => user.id, { onDelete: "cascade" }),
  listId: integer("listId").references(() => gameList.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),

});
