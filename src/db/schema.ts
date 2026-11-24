import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const destinations = sqliteTable("destinations", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  description: text("description").notNull(),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  destinationId: text("destination_id")
    .notNull()
    .references(() => destinations.id),
  description: text("description").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  capacity: integer("capacity").notNull(),
  nightlyPriceCents: integer("nightly_price_cents").notNull(),
  weeklyPriceCents: integer("weekly_price_cents").notNull(),
  minNights: integer("min_nights").notNull().default(7),
  amenities: text("amenities", { mode: "json" }).$type<string[]>().notNull(),
  images: text("images", { mode: "json" }).$type<string[]>().notNull(),
  locationLabel: text("location_label").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status", {
    enum: ["pending", "confirmed", "declined"],
  })
    .notNull()
    .default("pending"),
  totalCents: integer("total_cents").notNull(),
  createdAt: text("created_at").notNull(),
});

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull().default("Blocked"),
  createdAt: text("created_at").notNull(),
});

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Admin = typeof admins.$inferSelect;
