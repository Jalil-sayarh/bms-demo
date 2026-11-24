import { z } from "zod";

export const searchSchema = z.object({
  destination: z.string().optional().default("all"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().min(1).max(30).optional().default(2),
});

export const bookingRequestSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(30),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().max(40).optional().default(""),
  message: z.string().max(2000).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const propertyUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120),
  locationLabel: z.string().min(2).max(160),
  description: z.string().min(10),
  bedrooms: z.coerce.number().int().min(1).max(30),
  bathrooms: z.coerce.number().int().min(1).max(30),
  capacity: z.coerce.number().int().min(1).max(40),
  nightlyPriceCents: z.coerce.number().int().min(1),
  weeklyPriceCents: z.coerce.number().int().min(1),
  minNights: z.coerce.number().int().min(1).max(30),
  amenities: z.string(),
  published: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

export const blockSchema = z.object({
  propertyId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1).max(200).default("Blocked"),
});
