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

let client: Client | null = null;

export function getClient(): Client {
  if (client) {
    return client;
  }

  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (process.env.VERCEL && !url) {
    throw new Error(
      "Missing TURSO_DATABASE_URL. Add a Turso database URL (and TURSO_AUTH_TOKEN) in the Vercel project env vars.",
    );
  }

  if (url && !url.startsWith("file:")) {
    client = createClient({
      url,
      authToken,
    });
  } else {
    client = createClient({
      url: url || resolveLocalFileUrl(),
    });
  }

  return client;
}
