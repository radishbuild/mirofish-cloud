import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { getLimits } from "@/lib/plans";
import {
  resolveProviderName,
  resolveDockerImage,
  createInstance,
} from "@/lib/providers";
import type { InstanceConfig } from "@/lib/providers/types";
import { providerCredentials } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const {
    name = "",
    provider = "",
    ollamaModel = "qwen2.5:32b",
    gpuType = "A10G",
  } = body;

  const limits = getLimits();

  const active = await db
    .select()
    .from(instances)
    .where(
      and(
        eq(instances.userId, session.user.id),
        ne(instances.status, "destroyed"),
      ),
    );
  if (active.length >= limits.maxInstances) {
    return NextResponse.json(
      { error: `Instance limit reached (${limits.maxInstances})` },
      { status: 403 },
    );
  }

  const providerName = resolveProviderName(provider);

  // Validate that user has credentials for the chosen provider
  {
    const [cred] = await db
      .select({ id: providerCredentials.id })
      .from(providerCredentials)
      .where(
        and(
          eq(providerCredentials.userId, session.user.id),
          eq(providerCredentials.provider, providerName),
        ),
      );
    if (!cred) {
      return NextResponse.json(
        { error: `Connect your ${providerName} account first in Settings.` },
        { status: 400 },
      );
    }
  }

  const [inst] = await db
    .insert(instances)
    .values({
      userId: session.user.id,
      name,
      provider: providerName,
      gpuType,
      ollamaModel,
      status: "provisioning",
    })
    .returning();

  const config: InstanceConfig = {
    userId: session.user.id,
    instanceId: inst.id,
    ollamaModel,
    gpuType,
    neo4jPassword: "",
    dockerImage: resolveDockerImage(),
  };

  try {
    const info = await createInstance(providerName, config, session.user.id);
    const [updated] = await db
      .update(instances)
      .set({
        providerInstanceId: info.providerId,
        instanceUrl: info.url,
        status: info.status,
      })
      .where(eq(instances.id, inst.id))
      .returning();
    return NextResponse.json(updated);
  } catch (e: unknown) {
    await db.delete(instances).where(eq(instances.id, inst.id));
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Deployment failed: ${message}` },
      { status: 500 },
    );
  }
}
