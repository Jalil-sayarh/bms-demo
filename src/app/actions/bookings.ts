"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { bookings } from "@/db/schema";
import { checkPropertyAvailability } from "@/lib/availability";
import { bookingRequestSchema } from "@/lib/validators";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function createBookingRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = bookingRequestSchema.safeParse({
    propertyId: formData.get("propertyId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    guestPhone: formData.get("guestPhone") || "",
    message: formData.get("message") || "",
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check the form fields and try again." };
  }

  await ensureDb();
  const data = parsed.data;
  const availability = await checkPropertyAvailability({
    propertyId: data.propertyId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
  });

  if (!availability.ok) {
    return { ok: false, message: availability.reason };
  }

  await db.insert(bookings).values({
    id: nanoid(),
    propertyId: data.propertyId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    message: data.message,
    status: "pending",
    totalCents: availability.totalCents,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath(`/stays`);

  return {
    ok: true,
    message:
      "Request received. Our team will confirm availability and get back to you shortly.",
  };
}
