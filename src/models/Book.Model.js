import { pgTable, serial, varchar, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  pricePerDay: decimal('price_per_day', { precision: 10, scale: 2 }).notNull(),
  groupPricePerDay: decimal('group_price_per_day', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
