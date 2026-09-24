import { index, serial, text, timestamp, uniqueIndex, pgTable } from "drizzle-orm/pg-core";

export const userProfilesTable = pgTable(
  "user_profiles",
  {
    id: serial("id").primaryKey(),
    authUserId: text("auth_user_id").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("user_profiles_auth_user_id_unique").on(table.authUserId),
    index("user_profiles_email_idx").on(table.email),
  ],
);

export type UserProfile = typeof userProfilesTable.$inferSelect;