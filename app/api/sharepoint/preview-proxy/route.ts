export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { darAttachments, darMasters, darApprovals } from "@/db/schema";
import { getFileInfo } from "@/lib/sharepoint";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ data: null, error: "itemId is required" }, { status: 400 });
    }

    const isPrivileged = session.user.role === "QMS" || session.user.role === "MR" || session.user.role === "IT";

    if (!isPrivileged) {
      const [attachment] = await db
        .select({ darMasterId: darAttachments.darMasterId })
        .from(darAttachments)
        .where(eq(darAttachments.spItemId, itemId))
        .limit(1);

      if (!attachment) {
        return NextResponse.json({ data: null, error: "File not found" }, { status: 404 });
      }

      const [darRow] = await db
        .select({ requesterId: darMasters.requesterId })
        .from(darMasters)
        .where(eq(darMasters.id, attachment.darMasterId))
        .limit(1);

      const isRequester = darRow?.requesterId === session.user.id;
      if (!isRequester) {
        const [assigned] = await db
          .select({ id: darApprovals.id })
          .from(darApprovals)
          .where(and(
            eq(darApprovals.darMasterId, attachment.darMasterId),
            eq(darApprovals.assignedUserId, session.user.id),
          ))
          .limit(1);

        if (!assigned) {
          return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const info = await getFileInfo(itemId);

    if (!info.downloadUrl) {
      return NextResponse.json({ data: null, error: "File not available" }, { status: 502 });
    }

    const upstream = await fetch(info.downloadUrl, {
      headers: { Accept: "*/*" },
    });

    if (!upstream.ok) {
      return NextResponse.json({ data: null, error: "Failed to retrieve file" }, { status: 502 });
    }

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": info.mimeType || upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(info.name)}"`,
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[preview-proxy]", err);
    return NextResponse.json({ data: null, error: "Failed to retrieve file" }, { status: 500 });
  }
}
