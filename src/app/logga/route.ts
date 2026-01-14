import { NextResponse } from "next/server";

// Maps /logga to the actual logo asset in /public
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/logga.png", request.url), 308);
}


