import { pgTable, serial, integer, date, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./User.Model.js";
import { books } from "./Book.Model.js";

export const borrows = pgTable("borrows", {
  id: serial("id").primaryKey(),

  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  borrowDate: date("borrow_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),

  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  overdue: decimal("overdue", { precision: 10, scale: 2 }).default("0"),

  status: varchar("status", { length: 20 }).default("ACTIVE"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
