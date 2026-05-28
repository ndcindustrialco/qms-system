import { NextResponse } from "next/server";
import { AppError } from "@/errors/customErrors";
import { ZodError } from "zod";

export function handleApiError(error: unknown): NextResponse {
  // Only log unexpected server errors — 4xx errors are expected flow, not bugs
  if (!(error instanceof AppError) || error.statusCode >= 500) {
    console.error("[API Error]:", error);
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.errorCode,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Fallback for unhandled native/unknown errors
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  );
}
