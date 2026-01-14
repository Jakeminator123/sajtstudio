import { NextRequest, NextResponse } from "next/server";
import type { AuditResult } from "@/types/audit";

// Extend Next.js route timeout for PDF generation
export const maxDuration = 60;

const isProduction = process.env.NODE_ENV === "production";
const debugLog = (...args: unknown[]) => {
  if (!isProduction) {
    console.log(...args);
  }
};

// Validation helper
function validateAuditResult(result: unknown): result is AuditResult {
  if (!result || typeof result !== "object") return false;

  const r = result as Record<string, unknown>;

  // Check required fields
  if (
    !r.audit_type ||
    !["website_audit", "recommendation"].includes(r.audit_type as string)
  ) {
    return false;
  }

  if (!r.cost || typeof r.cost !== "object") {
    return false;
  }

  const cost = r.cost as Record<string, unknown>;
  if (
    typeof cost.tokens !== "number" ||
    typeof cost.sek !== "number" ||
    typeof cost.usd !== "number"
  ) {
    return false;
  }

  return true;
}

// Dynamic import to avoid SSR issues
async function generatePDF(result: AuditResult) {
  const pdfStartTime = Date.now();
  try {
    // Dynamically import React PDF dependencies
    const ReactPDF = await import("@react-pdf/renderer");
    const { renderToBuffer } = ReactPDF;
    const AuditPDFDocument = (await import("@/components/audit/PDFReport"))
      .default;
    const React = await import("react");

    // Generate PDF using React.createElement
    // AuditPDFDocument returns a Document component which renderToBuffer expects
    // Type assertion needed because @react-pdf/renderer types don't match our component signature
    const element = React.createElement(AuditPDFDocument, { result });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(element as any);

    const pdfDuration = Date.now() - pdfStartTime;
    debugLog(
      `PDF generated in ${pdfDuration}ms, size: ${pdfBuffer.length} bytes`
    );

    return pdfBuffer;
  } catch (error) {
    const pdfDuration = Date.now() - pdfStartTime;
    console.error(`PDF generation error after ${pdfDuration}ms:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `pdf_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;

  try {
    let body;
    try {
      body = await request.json();
      debugLog(`[${requestId}] PDF request received`);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request" },
        { status: 400 }
      );
    }

    const { result } = body;

    if (!result) {
      console.error(`[${requestId}] No result data provided`);
      return NextResponse.json(
        { error: "No result data provided" },
        { status: 400 }
      );
    }

    // Validate result structure
    if (!validateAuditResult(result)) {
      console.error(`[${requestId}] Invalid result structure:`, {
        hasAuditType: !!result.audit_type,
        hasCost: !!result.cost,
        resultKeys: Object.keys(result),
      });
      return NextResponse.json(
        { error: "Invalid result data structure" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(result);

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error(`[${requestId}] Generated PDF is empty`);
      return NextResponse.json(
        { error: "Generated PDF is empty" },
        { status: 500 }
      );
    }

    const totalDuration = Date.now() - requestStartTime;
    debugLog(`[${requestId}] PDF request completed in ${totalDuration}ms`);

    // Generate filename
    const dateStr = new Date().toISOString().split("T")[0];
    const domainPart = result.domain
      ? result.domain.replace(/\./g, "_").replace(/[^a-zA-Z0-9_]/g, "")
      : result.audit_type;
    const filename = `audit-${domainPart}-${dateStr}.pdf`;

    // Return PDF as response - convert Buffer to ArrayBuffer for NextResponse
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Request-ID": requestId,
        "X-Response-Time": `${totalDuration}ms`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    console.error(
      `[${requestId}] PDF generation error after ${totalDuration}ms:`,
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    // Provide more specific error messages
    let errorMessage = "Failed to generate PDF. Please try again later.";
    if (error instanceof Error) {
      if (
        error.message.includes("timeout") ||
        error.message.includes("Timeout")
      ) {
        errorMessage = "PDF generation timed out. Please try again.";
      } else if (
        error.message.includes("memory") ||
        error.message.includes("Memory")
      ) {
        errorMessage =
          "PDF generation failed due to memory constraints. Please try again.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
