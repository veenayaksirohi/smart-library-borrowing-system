import { pgTable, serial, integer, decimal, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { users } from "./User.Model.js";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("PENDING"),

  date: date("date").default(new Date()),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
