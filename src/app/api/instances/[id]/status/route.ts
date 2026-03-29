import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getProviderForUser } from "@/lib/providers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [inst] = await db
    .select()
    .from(instances)
    .where(and(eq(instances.id, id), eq(instances.userId, session.user.id)));
  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (inst.providerInstanceId && inst.status !== "destroyed") {
    try {
      const provider = await getProviderForUser(session.user.id, inst.provider);

      // 1. Get live status (also caches instance data for getInstanceUrl)
      let liveStatus = await provider.getStatus(inst.providerInstanceId);

      // 2. Get/refresh URL from cached instance data (no extra API call)
      if (provider.getInstanceUrl) {
        const url = await provider
          .getInstanceUrl(inst.providerInstanceId)
          .catch(() => null);
        if (url && url !== inst.instanceUrl) {
          await db
            .update(instances)
            .set({ instanceUrl: url })
            .where(eq(instances.id, id));
          inst.instanceUrl = url;
        }
      }

      // 3. Only mark "running" if URL exists AND health check passes
      if (liveStatus === "running") {
        if (!inst.instanceUrl) {
          liveStatus = "provisioning";
        } else {
          try {
            const health = await fetch(`${inst.instanceUrl}/health`, {
              signal: AbortSignal.timeout(5000),
            });
            if (!health.ok) liveStatus = "provisioning";
          } catch {
            liveStatus = "provisioning";
          }
        }
      }

      // 4. Update DB if status changed
      if (liveStatus !== inst.status) {
        const [updated] = await db
          .update(instances)
          .set({
            status: liveStatus,
            lastActiveAt:
              liveStatus === "running" ? new Date() : inst.lastActiveAt,
          })
          .where(eq(instances.id, id))
          .returning();
        return NextResponse.json(updated);
      }
    } catch (e: unknown) {
      console.error("Status check failed for", id, e);
    }
  }

  return NextResponse.json(inst);
}
