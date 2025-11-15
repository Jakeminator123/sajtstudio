import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface ErrorLog {
  timestamp: string;
  type: 'error' | 'warning' | 'unhandled' | 'boundary';
  message: string;
  stack?: string;
  source?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
}

const LOG_DIR = join(process.cwd(), 'logs');
const ERROR_LOG_FILE = join(LOG_DIR, 'browser-errors.json');

async function ensureLogDir() {
  try {
    await mkdir(LOG_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore
  }
}

async function appendError(error: ErrorLog) {
  await ensureLogDir();
  
  try {
    // Read existing errors
    const fs = await import('fs/promises');
    let existingErrors: ErrorLog[] = [];
    
    try {
      const content = await fs.readFile(ERROR_LOG_FILE, 'utf-8');
      existingErrors = JSON.parse(content);
    } catch {
      // File doesn't exist yet, start fresh
      existingErrors = [];
    }
    
    // Add new error
    existingErrors.push(error);
    
    // Keep only last 100 errors to prevent file from growing too large
    const recentErrors = existingErrors.slice(-100);
    
    // Write back
    await writeFile(ERROR_LOG_FILE, JSON.stringify(recentErrors, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write error log:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLog = await request.json();
    
    // Add timestamp if not present
    if (!errorData.timestamp) {
      errorData.timestamp = new Date().toISOString();
    }
    
    // Add URL and user agent from request
    errorData.url = request.headers.get('referer') || undefined;
    errorData.userAgent = request.headers.get('user-agent') || undefined;
    
    // Log error to file
    await appendError(errorData);
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Browser error logged:', errorData);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error logging endpoint failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(ERROR_LOG_FILE, 'utf-8');
    const errors = JSON.parse(content);
    return NextResponse.json({ errors }, { status: 200 });
  } catch (error) {
    // File doesn't exist or is empty
    return NextResponse.json({ errors: [] }, { status: 200 });
  }
}

