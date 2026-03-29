import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getProviderForUser } from "@/lib/providers";

export async function POST(
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

  try {
    if (inst.providerInstanceId) {
      const provider = await getProviderForUser(session.user.id, inst.provider);
      await provider.restartInstance(inst.providerInstanceId);
    }
    await db
      .update(instances)
      .set({ status: "provisioning" })
      .where(eq(instances.id, id));
    return NextResponse.json({ status: "restarting" });
  } catch (e: unknown) {
    console.error("Failed to restart instance", id, e);
    const message =
      e instanceof Error ? e.message : "Provider failed to restart instance";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
