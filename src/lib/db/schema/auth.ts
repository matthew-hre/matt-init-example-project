import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().$defaultFn(() => false).notNull(),
  image: text(),
  createdAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp().$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const game = pgTable("game", {

  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  url: text("url"),
  siteName: text("siteName"),
  tags: text("tags"),
  orderIndex: integer("orderIndex"),
  // listId: integer("listId").references(() => list.id, { onDelete: "cascade" }), // assumes you have a list table
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),

});

export const vote = pgTable("vote", {

  id: integer("id").primaryKey().notNull(),
  isUp: boolean("isUp").notNull(),
  userId: integer("userId").references(() => user.id, { onDelete: "cascade" }),
  // listId: integer("listId").references(() => list.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),

});

export const gameList = pgTable("game_list", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  tags: text("tags"),
  isPublic: boolean("isPublic").notNull().default(false),
  userId: integer("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),

});
