// Runs every SQL file in db/seed in name order. Seed files must be safe to re-run.
// Usage: DATABASE_URL=postgres://... node db/seed.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "seed");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await client.query(await readFile(join(dir, file), "utf8"));
    console.log("seeded", file);
  }
} finally {
  await client.end();
}
