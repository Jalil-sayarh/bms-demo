import bcrypt from "bcryptjs";
import { getClient } from "./client";
import { db } from "./index";
import { CREATE_TABLES_SQL } from "./schema-sql";
import { destinationRows, propertyRows } from "./seed-data";
import { admins, blocks, bookings, destinations, properties } from "./schema";

let readyPromise: Promise<void> | null = null;

async function createTables() {
  const client = getClient();
  const statements = CREATE_TABLES_SQL.split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }
}

async function seedIfEmpty() {
  const existing = await db.select().from(destinations).limit(1);
  if (existing.length > 0) {
    return;
  }

  await db.insert(destinations).values(destinationRows);
  await db.insert(properties).values(propertyRows);

  const now = new Date().toISOString();

  await db.insert(bookings).values([
    {
      id: "book-confirmed-1",
      propertyId: "prop-eupheme",
      checkIn: "2026-07-04",
      checkOut: "2026-07-11",
      guests: 10,
      guestName: "Sophie Martin",
      guestEmail: "sophie@example.com",
      guestPhone: "+33 6 00 00 00 01",
      message: "Looking forward to the week.",
      status: "confirmed",
      totalCents: 9_000_000,
      createdAt: now,
    },
    {
      id: "book-pending-1",
      propertyId: "prop-andaz",
      checkIn: "2026-12-19",
      checkOut: "2026-12-26",
      guests: 12,
      guestName: "James Carter",
      guestEmail: "james@example.com",
      guestPhone: "+44 7700 900123",
      message: "Christmas week request — flexible on arrival time.",
      status: "pending",
      totalCents: 11_000_000,
      createdAt: now,
    },
  ]);

  await db.insert(blocks).values([
    {
      id: "block-1",
      propertyId: "prop-laferme",
      startDate: "2026-08-01",
      endDate: "2026-08-08",
      reason: "Owner stay",
      createdAt: now,
    },
    {
      id: "block-2",
      propertyId: "prop-namur",
      startDate: "2026-12-20",
      endDate: "2026-12-27",
      reason: "Maintenance",
      createdAt: now,
    },
  ]);

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(admins).values({
    id: "admin-1",
    email: "admin@demo.local",
    passwordHash,
    name: "Demo Admin",
  });
}

export async function ensureDb() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await createTables();
      await seedIfEmpty();
    })().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }

  await readyPromise;
}
