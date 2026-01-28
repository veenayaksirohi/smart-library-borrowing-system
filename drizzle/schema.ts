import { pgTable, serial, varchar, numeric, boolean, timestamp, foreignKey, integer, date, unique } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const books = pgTable("books", {
	id: serial("id").primaryKey().notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	author: varchar("author", { length: 255 }).notNull(),
	pricePerDay: numeric("price_per_day", { precision: 10, scale:  2 }).notNull(),
	groupPricePerDay: numeric("group_price_per_day", { precision: 10, scale:  2 }).notNull(),
	available: boolean("available").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const borrows = pgTable("borrows", {
	id: serial("id").primaryKey().notNull(),
	bookId: integer("book_id").notNull().references(() => books.id),
	userId: integer("user_id").notNull().references(() => users.id),
	borrowDate: date("borrow_date").notNull(),
	dueDate: date("due_date").notNull(),
	returnDate: date("return_date"),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }).notNull(),
	overdue: numeric("overdue", { precision: 10, scale:  2 }).default('0'),
	status: varchar("status", { length: 20 }).default('Active'::character varying).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	email: varchar("email", { length: 100 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	balance: numeric("balance", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		usersEmailUnique: unique("users_email_unique").on(table.email),
	}
});

export const payments = pgTable("payments", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id),
	amount: numeric("amount", { precision: 10, scale:  2 }).notNull(),
	status: varchar("status", { length: 20 }).default('Pending'::character varying).notNull(),
	date: date("date").defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});