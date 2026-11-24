"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { blocks, bookings, properties } from "@/db/schema";
import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
  verifyAdminCredentials,
} from "@/lib/auth";
import { checkPropertyAvailability } from "@/lib/availability";
import { isDateRangeValid } from "@/lib/dates";
import {
  blockSchema,
  loginSchema,
  propertyUpdateSchema,
} from "@/lib/validators";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

export async function loginAdmin(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const valid = await verifyAdminCredentials(
    parsed.data.email,
    parsed.data.password,
  );

  if (!valid) {
    return { ok: false, message: "Invalid credentials." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["confirmed", "declined", "pending"].includes(status)) {
    throw new Error("Invalid booking update");
  }

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (status === "confirmed") {
    const availability = await checkPropertyAvailability({
      propertyId: booking.propertyId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      excludeBookingId: booking.id,
    });

    if (!availability.ok) {
      throw new Error(availability.reason);
    }
  }

  await db
    .update(bookings)
    .set({ status: status as "pending" | "confirmed" | "declined" })
    .where(eq(bookings.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/stays");
  revalidatePath(`/admin/properties/${booking.propertyId}`);
}

export async function updateProperty(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = propertyUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    locationLabel: formData.get("locationLabel"),
    description: formData.get("description"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    capacity: formData.get("capacity"),
    nightlyPriceCents: formData.get("nightlyPriceCents"),
    weeklyPriceCents: formData.get("weeklyPriceCents"),
    minNights: formData.get("minNights"),
    amenities: formData.get("amenities"),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the property fields." };
  }

  const amenities = parsed.data.amenities
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await db
    .update(properties)
    .set({
      name: parsed.data.name,
      locationLabel: parsed.data.locationLabel,
      description: parsed.data.description,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      capacity: parsed.data.capacity,
      nightlyPriceCents: parsed.data.nightlyPriceCents,
      weeklyPriceCents: parsed.data.weeklyPriceCents,
      minNights: parsed.data.minNights,
      amenities,
      published: parsed.data.published,
      featured: parsed.data.featured,
    })
    .where(eq(properties.id, parsed.data.id));

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${parsed.data.id}`);
  revalidatePath("/stays");
  revalidatePath(`/stays`);

  return { ok: true, message: "Property saved." };
}

export async function createBlock(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = blockSchema.safeParse({
    propertyId: formData.get("propertyId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || "Blocked",
  });

  if (!parsed.success || !isDateRangeValid(parsed.data.startDate, parsed.data.endDate)) {
    return { ok: false, message: "Enter a valid block date range." };
  }

  await db.insert(blocks).values({
    id: nanoid(),
    propertyId: parsed.data.propertyId,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    reason: parsed.data.reason,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/admin/properties/${parsed.data.propertyId}`);
  revalidatePath("/stays");

  return { ok: true, message: "Dates blocked." };
}

export async function deleteBlock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const propertyId = String(formData.get("propertyId") || "");
  if (!id) {
    throw new Error("Missing block id");
  }

  await db.delete(blocks).where(eq(blocks.id, id));
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/stays");
}
