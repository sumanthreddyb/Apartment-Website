import ApartmentApp from "@/components/apartment-app";
import { auth } from "@/auth";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { apartments, memberships } from "@/db/schema";

export default async function Home() {
  if (process.env.DEMO_MODE === "true") return <ApartmentApp demoMode apartmentSlug="cedar-grove" communityName="Cedar Grove"/>;
  const session = await auth();
  if (!session?.user?.id) {
    return <main className="signin-shell"><div className="signin-card"><div className="brand signin-brand"><span className="brand-mark">⌂</span><span>apartment<span className="brand-strong">hub</span></span></div><h1>Welcome home.</h1><p>Sign in with your community email to continue.</p><a className="primary-button signin-link" href="/signin">Continue to sign in <span>→</span></a></div></main>;
  }
  const [membership] = db ? await db.select({ slug: apartments.slug, name: apartments.name, role: memberships.role }).from(memberships).innerJoin(apartments, eq(memberships.apartmentId, apartments.id)).where(and(eq(memberships.userId, session.user.id), eq(memberships.status, "active"))).limit(1) : [];
  if (!membership) {
    return <main className="signin-shell"><div className="signin-card"><div className="brand signin-brand"><span className="brand-mark">⌂</span><span>apartment<span className="brand-strong">hub</span></span></div><h1>No community linked yet.</h1><p>Your sign-in worked, but there isn’t an active apartment membership on this account.</p></div></main>;
  }
  return <ApartmentApp demoMode={false} apartmentSlug={membership.slug} communityName={membership.name} userName={session.user.name ?? session.user.email ?? "Resident"} role={membership.role}/>;
}
