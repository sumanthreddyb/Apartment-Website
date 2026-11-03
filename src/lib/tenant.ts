import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { apartments, memberships } from "@/db/schema";

export async function getApartmentAccess(slug: string) {
  const session = await auth();
  if (!session?.user?.id || !db) return null;
  const [membership] = await db.select({ apartmentId: apartments.id, role: memberships.role, flatId: memberships.flatId })
    .from(memberships).innerJoin(apartments, eq(memberships.apartmentId, apartments.id))
    .where(and(eq(apartments.slug, slug), eq(memberships.userId, session.user.id), eq(memberships.status, "active"))).limit(1);
  return membership ? { ...membership, userId: session.user.id } : null;
}

export const operationalRoles = ["platform_admin", "apartment_admin", "treasurer", "committee", "facility_manager", "security_guard", "maintenance_staff"] as const;
export const privateFinanceRoles = ["platform_admin", "apartment_admin", "treasurer"] as const;
