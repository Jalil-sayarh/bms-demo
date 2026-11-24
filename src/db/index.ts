import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { getClient } from "./client";
import * as schema from "./schema";

type Db = LibSQLDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

/** Lazy proxy so importing this module does not open a DB connection at build time. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb(), prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
