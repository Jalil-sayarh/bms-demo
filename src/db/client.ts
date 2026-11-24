import { createClient, type Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

function resolveLocalFileUrl(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "demo.db");
  return `file:${dbPath}`;
}

/** True while `next build` is collecting page data / compiling. */
export function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

let client: Client | null = null;

export function getClient(): Client {
  if (client) {
    return client;
  }

  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && !url.startsWith("file:")) {
    client = createClient({
      url,
      authToken,
    });
    return client;
  }

  // Vercel build runs with VERCEL=1 before project env may be available.
  // Ephemeral memory DB lets page-data collection succeed.
  if (process.env.VERCEL && !url) {
    if (isBuildTime()) {
      client = createClient({ url: ":memory:" });
      return client;
    }

    throw new Error(
      "Missing TURSO_DATABASE_URL. Add a Turso database URL (and TURSO_AUTH_TOKEN) in the Vercel project env vars.",
    );
  }

  client = createClient({
    url: url || resolveLocalFileUrl(),
  });

  return client;
}
