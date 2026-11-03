import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { flats, requests } from "@/db/schema";
import { getApartmentAccess, operationalRoles } from "@/lib/tenant";

const createRequestSchema = z.object({ apartment: z.string().min(1), flatId: z.string().uuid().optional(), title: z.string().trim().min(3).max(180), category: z.string().trim().min(2).max(80), description: z.string().trim().min(5).max(4000), priority: z.enum(["low", "normal", "high"]).default("normal") });

export async function GET(request: Request) {
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const slug = new URL(request.url).searchParams.get("apartment") ?? "";
  const access = await getApartmentAccess(slug);
  if (!access) return NextResponse.json({ error: "Apartment membership required" }, { status: 403 });
  const canViewAll = (operationalRoles as readonly string[]).includes(access.role);
  const residentScope = access.flatId ? eq(requests.flatId, access.flatId) : eq(requests.createdBy, access.userId);
  const rows = await db.select({ title: requests.title, category: requests.category, flat: flats.number, status: requests.status, createdAt: requests.createdAt }).from(requests).leftJoin(flats, eq(requests.flatId, flats.id)).where(canViewAll ? eq(requests.apartmentId, access.apartmentId) : and(eq(requests.apartmentId, access.apartmentId), residentScope)).orderBy(desc(requests.createdAt));
  return NextResponse.json({ requests: rows });
}

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const parsed = createRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const access = await getApartmentAccess(parsed.data.apartment);
  if (!access) return NextResponse.json({ error: "Apartment membership required" }, { status: 403 });
  const flatId = parsed.data.flatId ?? access.flatId ?? undefined;
  if (flatId) {
    const [flat] = await db.select({ id: flats.id }).from(flats).where(and(eq(flats.id, flatId), eq(flats.apartmentId, access.apartmentId))).limit(1);
    if (!flat) return NextResponse.json({ error: "Flat does not belong to this apartment" }, { status: 400 });
    if (!(operationalRoles as readonly string[]).includes(access.role) && access.flatId !== flatId) return NextResponse.json({ error: "You can only submit requests for your own flat" }, { status: 403 });
  }
  const [created] = await db.insert(requests).values({ apartmentId: access.apartmentId, createdBy: access.userId, flatId, title: parsed.data.title, category: parsed.data.category, description: parsed.data.description, priority: parsed.data.priority }).returning();
  return NextResponse.json({ request: created }, { status: 201 });
}
