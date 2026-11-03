import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
const client = url ? postgres(url, { max: 10, prepare: false }) : null;
export const db = client ? drizzle(client, { schema }) : null;
