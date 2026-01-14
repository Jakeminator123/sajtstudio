/**
 * Seed Content Script
 * 
 * Populates the content database with default values.
 * Run with: npx tsx scripts/seed-content.ts
 */

import { seedDefaults, getContentStats } from "../src/lib/content-database";

console.log("🌱 Seeding content database...\n");

try {
  const inserted = seedDefaults();
  const stats = getContentStats();
  
  console.log(`✅ Seeded ${inserted} new content entries`);
  console.log(`📊 Total content entries: ${stats.total}`);
  console.log(`📝 Customized entries: ${stats.customized}`);
  console.log(`📁 Sections: ${stats.sections.join(", ")}`);
  console.log("\n🎉 Content database is ready!");
} catch (error) {
  console.error("❌ Error seeding content:", error);
  process.exit(1);
}

