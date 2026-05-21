export const runtime = 'nodejs';

import { requireRole } from "@/lib/auth";
import { deleteItem } from "@/lib/sharepoint";
import { z } from "zod";

const Schema = z.object({
  itemId: z.string().min(1),
});

export async function DELETE(req: Request) {
  try {
    await requireRole("QMS", "MR", "IT");
    const { searchParams } = new URL(req.url);
    const parsed = Schema.safeParse({ itemId: searchParams.get("itemId") });

    if (!parsed.success) {
      return Response.json({ data: null, error: "itemId is required" }, { status: 400 });
    }

    await deleteItem(parsed.data.itemId);

    return Response.json({ data: { deleted: true }, error: null });
  } catch (err) {
    console.error("[DELETE /api/sharepoint/delete-item]", err);
    return Response.json({ data: null, error: "Failed to delete item" }, { status: 500 });
  }
}
