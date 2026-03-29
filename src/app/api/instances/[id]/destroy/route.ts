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

  if (inst.providerInstanceId) {
    try {
      const provider = await getProviderForUser(session.user.id, inst.provider);
      await provider.destroyInstance(inst.providerInstanceId);
    } catch (e: unknown) {
      // Don't mark as destroyed if the provider call failed — the resource may still be running
      const message = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        {
          error: `Failed to destroy provider resource: ${message}. Instance kept active so you can retry.`,
        },
        { status: 502 },
      );
    }
  }

  await db
    .update(instances)
    .set({ status: "destroyed", destroyedAt: new Date() })
    .where(eq(instances.id, id));
  return NextResponse.json({ status: "destroyed" });
}
