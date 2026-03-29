import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";
import { getProviderForUser } from "@/lib/providers";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await db
    .select()
    .from(instances)
    .where(inArray(instances.status, ["running", "provisioning"]));

  await Promise.allSettled(
    active.map(async (inst) => {
      if (!inst.providerInstanceId) return;
      try {
        const provider = await getProviderForUser(inst.userId, inst.provider);

        // 1. Get live status (caches instance data for getInstanceUrl)
        let liveStatus = await provider.getStatus(inst.providerInstanceId);

        // 2. Get/refresh URL from cached data (no extra API call)
        if (provider.getInstanceUrl) {
          const url = await provider
            .getInstanceUrl(inst.providerInstanceId)
            .catch(() => null);
          if (url && url !== inst.instanceUrl) {
            await db
              .update(instances)
              .set({ instanceUrl: url })
              .where(eq(instances.id, inst.id));
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

        // 4. Update DB if status changed (don't update lastActiveAt — reserved for user actions)
        if (liveStatus !== inst.status) {
          await db
            .update(instances)
            .set({ status: liveStatus })
            .where(eq(instances.id, inst.id));
        }
      } catch (e: unknown) {
        console.error("Poll status failed for", inst.id, e);
      }
    }),
  );

  return NextResponse.json({ polled: active.length });
}
