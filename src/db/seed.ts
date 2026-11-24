import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { sqlite } from "./index";
import { db } from "./index";
import {
  admins,
  blocks,
  bookings,
  destinations,
  properties,
} from "./schema";

function resetSchema() {
  sqlite.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS blocks;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS properties;
    DROP TABLE IF EXISTS destinations;
    DROP TABLE IF EXISTS admins;
    PRAGMA foreign_keys = ON;

    CREATE TABLE destinations (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE properties (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      destination_id TEXT NOT NULL REFERENCES destinations(id),
      description TEXT NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      nightly_price_cents INTEGER NOT NULL,
      weekly_price_cents INTEGER NOT NULL,
      min_nights INTEGER NOT NULL DEFAULT 7,
      amenities TEXT NOT NULL,
      images TEXT NOT NULL,
      location_label TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE bookings (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE blocks (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'Blocked',
      created_at TEXT NOT NULL
    );

    CREATE TABLE admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL
    );
  `);
}

async function seed() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  resetSchema();

  const destinationRows = [
    {
      id: "dest-sttropez",
      slug: "saint-tropez",
      name: "Saint-Tropez",
      region: "French Riviera",
      description:
        "Sunlit villas along the Golfe de Saint-Tropez, minutes from beaches and village life.",
    },
    {
      id: "dest-courchevel",
      slug: "courchevel",
      name: "Courchevel",
      region: "French Alps",
      description:
        "Alpine chalets in Courchevel 1850 and the surrounding villages for winter escapes.",
    },
  ];

  await db.insert(destinations).values(destinationRows);

  const propertyRows = [
    {
      id: "prop-eupheme",
      slug: "villa-eupheme",
      name: "Villa Eupheme",
      destinationId: "dest-sttropez",
      description:
        "A contemporary 450 m² villa nestled among Tropezian vineyards, with a heated pool, fitness room, sauna, and private cinema. Six en-suite bedrooms and a pétanque court complete this refined Riviera retreat.",
      bedrooms: 7,
      bathrooms: 7,
      capacity: 14,
      nightlyPriceCents: 1_500_000,
      weeklyPriceCents: 9_000_000,
      minNights: 7,
      amenities: [
        "Heated pool",
        "Gym",
        "Sauna",
        "Home cinema",
        "Wifi",
        "Air conditioning",
        "Kids friendly",
      ],
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      ],
      locationLabel: "Saint-Tropez · Belle Isnarde",
      published: true,
      featured: true,
    },
    {
      id: "prop-laferme",
      slug: "villa-la-ferme",
      name: "Villa La Ferme",
      destinationId: "dest-sttropez",
      description:
        "A short walk from the beach, this contemporary villa pairs landscaped gardens with a pool, hammam, and massage room. Six en-suite bedrooms and outdoor dining make it ideal for long summer weeks.",
      bedrooms: 6,
      bathrooms: 6,
      capacity: 12,
      nightlyPriceCents: 1_285_000,
      weeklyPriceCents: 7_500_000,
      minNights: 7,
      amenities: [
        "Heated pool",
        "Hammam",
        "Gym",
        "Sea view",
        "Barbecue",
        "Wifi",
        "Housekeeping",
      ],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      ],
      locationLabel: "Saint-Tropez · Canebiers",
      published: true,
      featured: true,
    },
    {
      id: "prop-lina",
      slug: "villa-lina",
      name: "Villa Lina",
      destinationId: "dest-sttropez",
      description:
        "An intimate Ramatuelle villa with three bedrooms, a heated pool, and easy access for every guest. Quiet, family-friendly, and close to Pampelonne.",
      bedrooms: 3,
      bathrooms: 3,
      capacity: 6,
      nightlyPriceCents: 450_000,
      weeklyPriceCents: 2_800_000,
      minNights: 7,
      amenities: [
        "Heated pool",
        "Kids friendly",
        "Petanque",
        "Wifi",
        "Parking",
      ],
      images: [
        "https://images.unsplash.com/photo-1600047509807-ba8d526a1c56?w=1600&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
      ],
      locationLabel: "Ramatuelle",
      published: true,
      featured: false,
    },
    {
      id: "prop-sinopolis",
      slug: "villa-sinopolis",
      name: "Villa Sinopolis",
      destinationId: "dest-sttropez",
      description:
        "Five-bedroom villa in Gassin with parking, a heated pool, and panoramic views over the gulf. Designed for long, unhurried stays.",
      bedrooms: 5,
      bathrooms: 5,
      capacity: 10,
      nightlyPriceCents: 850_000,
      weeklyPriceCents: 5_200_000,
      minNights: 7,
      amenities: ["Heated pool", "Parking", "Wifi", "Air conditioning"],
      images: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1600&q=80",
      ],
      locationLabel: "Gassin",
      published: true,
      featured: true,
    },
    {
      id: "prop-andaz",
      slug: "chalet-andaz",
      name: "Chalet Andaz",
      destinationId: "dest-courchevel",
      description:
        "A Courchevel 1850 chalet with fireplace, jacuzzi, and ski-season staffing. Seven bedrooms for alpine weeks with friends or family.",
      bedrooms: 7,
      bathrooms: 7,
      capacity: 14,
      nightlyPriceCents: 1_800_000,
      weeklyPriceCents: 11_000_000,
      minNights: 7,
      amenities: [
        "Fireplace",
        "Jacuzzi",
        "Ski-in/ski-out",
        "Wifi",
        "Housekeeping",
      ],
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1600&q=80",
        "https://images.unsplash.com/photo-1518780662116-02457a87a3cd?w=1600&q=80",
      ],
      locationLabel: "Courchevel 1850",
      published: true,
      featured: true,
    },
    {
      id: "prop-namur",
      slug: "chalet-namur",
      name: "Chalet Namur",
      destinationId: "dest-courchevel",
      description:
        "Seasonal pick in Courchevel 1850: seven bedrooms, mountain views, and a warm timber interior built for winter hospitality.",
      bedrooms: 7,
      bathrooms: 7,
      capacity: 14,
      nightlyPriceCents: 1_650_000,
      weeklyPriceCents: 10_000_000,
      minNights: 7,
      amenities: ["Fireplace", "Wifi", "Sauna", "Ski room"],
      images: [
        "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1600&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
      ],
      locationLabel: "Courchevel 1850",
      published: true,
      featured: true,
    },
    {
      id: "prop-koh",
      slug: "chalet-koh",
      name: "Chalet Koh",
      destinationId: "dest-courchevel",
      description:
        "Six-bedroom chalet in Courchevel 1650 with fireplace and jacuzzi. An excellent base for slopes and village evenings.",
      bedrooms: 6,
      bathrooms: 6,
      capacity: 12,
      nightlyPriceCents: 980_000,
      weeklyPriceCents: 6_000_000,
      minNights: 7,
      amenities: ["Fireplace", "Jacuzzi", "Wifi", "Heated pool"],
      images: [
        "https://images.unsplash.com/photo-1510798831973-525272e1fbb1?w=1600&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
      ],
      locationLabel: "Courchevel 1650",
      published: true,
      featured: false,
    },
    {
      id: "prop-ilulissat",
      slug: "chalet-ilulissat",
      name: "Chalet Ilulissat",
      destinationId: "dest-courchevel",
      description:
        "A more intimate Courchevel Village chalet with three bedrooms, a fireplace, and a heated outdoor pool for après-ski evenings.",
      bedrooms: 3,
      bathrooms: 3,
      capacity: 6,
      nightlyPriceCents: 620_000,
      weeklyPriceCents: 3_800_000,
      minNights: 7,
      amenities: ["Fireplace", "Heated pool", "Wifi", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1499793983690-e8b21befc3c5?w=1600&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
      ],
      locationLabel: "Courchevel Village",
      published: true,
      featured: false,
    },
  ];

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

  console.log("Seed complete.");
  console.log("Admin login: admin@demo.local / admin123");
  console.log(`Properties: ${propertyRows.length}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
