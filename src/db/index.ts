import { drizzle } from "drizzle-orm/libsql";
import { getClient } from "./client";
import * as schema from "./schema";

export const db = drizzle(getClient(), { schema });
