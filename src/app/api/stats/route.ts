import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type Stats = {
  totalPageViews: number;
  todayPageViews: number;
  uniqueVisitors: number;
  lastUpdated: string;
  visitors: Record<string, string>;
};

const STATS_FILE = path.join(process.cwd(), "data", "stats.json");

async function ensureDir() {
  const dir = path.dirname(STATS_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readStats(): Promise<Stats> {
  await ensureDir();
  try {
    const raw = await fs.readFile(STATS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Stats;
    return normalizeForToday(parsed);
  } catch {
    return normalizeForToday({
      totalPageViews: 0,
      todayPageViews: 0,
      uniqueVisitors: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      visitors: {},
    });
  }
}

function normalizeForToday(stats: Stats): Stats {
  const today = new Date().toISOString().split("T")[0];
  if (stats.lastUpdated !== today) {
    return {
      ...stats,
      todayPageViews: 0,
      lastUpdated: today,
    };
  }
  return stats;
}

async function writeStats(stats: Stats) {
  await ensureDir();
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

export async function GET() {
  const stats = await readStats();
  return NextResponse.json({ success: true, stats });
}

export async function POST(request: NextRequest) {
  try {
    const { visitorId } = await request.json();
    const stats = await readStats();

    stats.totalPageViews += 1;
    stats.todayPageViews += 1;

    if (visitorId && !stats.visitors[visitorId]) {
      stats.uniqueVisitors += 1;
    }

    if (visitorId) {
      stats.visitors[visitorId] = stats.lastUpdated;
    }

    await writeStats(stats);

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to update stats", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stats" },
      { status: 500 }
    );
  }
}

