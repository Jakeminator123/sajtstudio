/**
 * Import script: Merges new.json into content-cache.json and updates database
 *
 * Usage: npx tsx scripts/import-new-content.ts
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db", "content.db");
const cachePath = path.join(process.cwd(), "content-cache.json");
const newJsonPath = path.join(process.cwd(), "new.json");

// Load existing cache
const existingCache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

// Load new.json
const newContent = JSON.parse(fs.readFileSync(newJsonPath, "utf-8"));

// Merge: new.json values override cache, but keep images/videos from cache
const merged: Record<string, any> = { ...existingCache };
for (const [key, value] of Object.entries(newContent)) {
  merged[key] = value;
}

// Write merged cache back
fs.writeFileSync(cachePath, JSON.stringify(merged, null, 2) + "\n");

console.log(`✅ Merged ${Object.keys(newContent).length} entries from new.json into content-cache.json`);

// Update database with merged values
const contentDb = new Database(dbPath);

const updateStmt = contentDb.prepare(`
  INSERT INTO content (key, type, section, value, label, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = datetime('now')
`);

let updatedCount = 0;
const transaction = contentDb.transaction(() => {
  for (const [key, entry] of Object.entries(merged)) {
    const result = updateStmt.run(
      key,
      entry.type,
      entry.section,
      entry.value,
      entry.label
    );
    if (result.changes > 0) {
      updatedCount++;
    }
  }
});

transaction();
contentDb.close();

console.log(`✅ Updated ${updatedCount} entries in database`);
console.log(`✅ Done! All changes from new.json are now in both cache.json and database`);

