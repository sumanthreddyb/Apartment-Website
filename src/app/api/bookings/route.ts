import { and, eq, gte, lt, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings, facilities } from "@/db/schema";
import { getApartmentAccess } from "@/lib/tenant";

const bookingSchema = z.object({ apartment: z.string().min(1), facilityId: z.string().uuid(), startsAt: z.coerce.date(), endsAt: z.coerce.date(), purpose: z.string().trim().max(500).optional() }).refine((value) => value.endsAt > value.startsAt, { message: "End time must be after start time", path: ["endsAt"] });

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.startsAt <= new Date()) return NextResponse.json({ error: "Booking time must be in the future" }, { status: 400 });
  const access = await getApartmentAccess(parsed.data.apartment);
  if (!access) return NextResponse.json({ error: "Apartment membership required" }, { status: 403 });
  const [facility] = await db.select({ id: facilities.id }).from(facilities).where(and(eq(facilities.id, parsed.data.facilityId), eq(facilities.apartmentId, access.apartmentId), eq(facilities.active, true), eq(facilities.bookingEnabled, true))).limit(1);
  if (!facility) return NextResponse.json({ error: "Facility is unavailable in this apartment" }, { status: 404 });
  const conflicts = await db.select({ id: bookings.id }).from(bookings).where(and(eq(bookings.apartmentId, access.apartmentId), eq(bookings.facilityId, facility.id), ne(bookings.status, "rejected"), ne(bookings.status, "cancelled"), lt(bookings.startsAt, parsed.data.endsAt), gte(bookings.endsAt, parsed.data.startsAt))).limit(1);
  if (conflicts.length) return NextResponse.json({ error: "This time overlaps another booking" }, { status: 409 });
  const [created] = await db.insert(bookings).values({ apartmentId: access.apartmentId, facilityId: facility.id, requestedBy: access.userId, startsAt: parsed.data.startsAt, endsAt: parsed.data.endsAt, purpose: parsed.data.purpose }).returning();
  return NextResponse.json({ booking: created }, { status: 201 });
}
