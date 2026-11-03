import { db } from "../src/db";
import { apartments, bookings, buildings, events, facilities, flats, invoices, memberships, notices, requests, users, vendors } from "../src/db/schema";

if (!db) throw new Error("Set DATABASE_URL before seeding.");

const communityId = "c0000000-0000-4000-8000-000000000001";
const buildingA = "a0000000-0000-4000-8000-000000000001";
const buildingB = "a0000000-0000-4000-8000-000000000002";
const adminId = "b0000000-0000-4000-8000-000000000001";
const flatIds = Array.from({ length: 10 }, (_, index) => `d0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`);

await db.insert(apartments).values({ id: communityId, name: "Cedar Grove Apartments", slug: "cedar-grove", address: "12th Main Road, Indiranagar", city: "Bengaluru", settings: { parking: true, lifts: true, clubhouse: true, securityDesk: true } }).onConflictDoNothing();
await db.insert(buildings).values([{ id: buildingA, apartmentId: communityId, name: "Building A", floors: 5 }, { id: buildingB, apartmentId: communityId, name: "Building B", floors: 5 }]).onConflictDoNothing();

const sampleResidents = [
  ["Ananya Rao", "ananya@example.test", "A-101", "owner"], ["Rahul Menon", "rahul@example.test", "A-102", "owner"], ["Siddharth Iyer", "siddharth@example.test", "A-103", "tenant"], ["Kavya Reddy", "kavya@example.test", "A-104", "owner"], ["Vikram Shetty", "vikram@example.test", "A-105", "owner"],
  ["Priya Nair", "priya@example.test", "B-201", "owner"], ["Neha Kulkarni", "neha@example.test", "B-202", "tenant"], ["Rohan Shah", "rohan@example.test", "B-203", "owner"], ["Karan Malhotra", "karan@example.test", "B-204", "owner"], ["Divya Menon", "divya@example.test", "B-205", "tenant"],
] as const;
const residentIds = sampleResidents.map((_, i) => `b0000000-0000-4000-8000-${String(i + 2).padStart(12, "0")}`);
await db.insert(users).values([{ id: adminId, name: "Arjun Sharma", email: "arjun@cedargrove.example.test" }, ...sampleResidents.map(([name, email], i) => ({ id: residentIds[i], name, email }))]).onConflictDoNothing();
await db.insert(memberships).values([{ apartmentId: communityId, userId: adminId, role: "apartment_admin" }, ...sampleResidents.map((r, i) => ({ apartmentId: communityId, userId: residentIds[i], role: r[3] as "owner" | "tenant", flatId: flatIds[i] }))]).onConflictDoNothing();
await db.insert(flats).values(sampleResidents.map((r, i) => ({ id: flatIds[i], apartmentId: communityId, buildingId: i < 5 ? buildingA : buildingB, number: r[2], floor: Number(r[2].slice(-3, -2)), areaSqft: 1120 + i * 25, parkingLabel: `P-${i + 1}`, occupied: true }))).onConflictDoNothing();

const hallId = "e0000000-0000-4000-8000-000000000001";
const lawnId = "e0000000-0000-4000-8000-000000000002";
await db.insert(facilities).values([{ id: hallId, apartmentId: communityId, name: "Party hall", description: "Community celebrations and family gatherings", capacity: 60, hourlyRatePaise: 150000, rules: "Reserve at least 48 hours ahead." }, { id: lawnId, apartmentId: communityId, name: "Garden lawn", description: "Open air community space", capacity: 100, hourlyRatePaise: 0 }]).onConflictDoNothing();
await db.insert(bookings).values([{ id: "f0000000-0000-4000-8000-000000000001", apartmentId: communityId, facilityId: hallId, requestedBy: adminId, startsAt: new Date("2026-11-07T13:00:00Z"), endsAt: new Date("2026-11-07T17:00:00Z"), status: "approved", purpose: "Community potluck" }, { id: "f0000000-0000-4000-8000-000000000002", apartmentId: communityId, facilityId: lawnId, requestedBy: adminId, startsAt: new Date("2026-11-12T04:30:00Z"), endsAt: new Date("2026-11-12T07:00:00Z"), status: "approved", purpose: "Association meeting" }]).onConflictDoNothing();
await db.insert(invoices).values(flatIds.map((flatId, index) => ({ apartmentId: communityId, flatId, period: "2026-11", amountPaise: 450000, dueDate: "2026-11-10", status: index < 8 ? "paid" : "unpaid", ...(index < 8 ? { paidAt: new Date("2026-11-01T08:00:00Z") } : {}) }))).onConflictDoNothing();
await db.insert(requests).values([{ id: "a1000000-0000-4000-8000-000000000001", apartmentId: communityId, createdBy: adminId, flatId: flatIds[0], title: "Water pressure low on 2nd floor", category: "Plumbing", description: "Pressure has been low since this morning.", status: "in_progress", priority: "normal" }, { id: "a1000000-0000-4000-8000-000000000002", apartmentId: communityId, createdBy: adminId, flatId: flatIds[2], title: "Lift door making a sound", category: "Elevator", description: "The lift door squeaks when it closes.", status: "open", priority: "high" }]).onConflictDoNothing();
await db.insert(notices).values([{ id: "a2000000-0000-4000-8000-000000000001", apartmentId: communityId, authorId: adminId, title: "Water supply maintenance", body: "There will be a temporary interruption on Wednesday, 4 November from 10 am to 1 pm while we service the overhead tank.", pinned: true }]).onConflictDoNothing();
await db.insert(events).values([{ id: "a3000000-0000-4000-8000-000000000001", apartmentId: communityId, title: "Community potluck", description: "Bring a dish to share with your neighbours.", startsAt: new Date("2026-11-07T13:00:00Z"), location: "Garden lawn", createdBy: adminId }, { id: "a3000000-0000-4000-8000-000000000002", apartmentId: communityId, title: "Association meeting", startsAt: new Date("2026-11-12T04:30:00Z"), location: "Clubhouse", createdBy: adminId }]).onConflictDoNothing();
await db.insert(vendors).values([{ id: "a4000000-0000-4000-8000-000000000001", apartmentId: communityId, name: "Suresh Elevators", category: "Lift maintenance", phone: "+91 98765 43210", active: true }, { id: "a4000000-0000-4000-8000-000000000002", apartmentId: communityId, name: "Ramesh Kumar", category: "Maintenance staff", phone: "+91 98765 12345", active: true }]).onConflictDoNothing();
console.log("Seeded Cedar Grove Apartments with 10 flats and sample operations data.");
await db.$client.end();
