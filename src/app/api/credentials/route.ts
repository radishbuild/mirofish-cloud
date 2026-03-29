import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { providerCredentials, instances } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { encrypt } from "@/lib/crypto";
import { PROVIDER_CREDENTIAL_FIELDS } from "@/lib/providers/types";
import { getProvider } from "@/lib/providers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      provider: providerCredentials.provider,
      updatedAt: providerCredentials.updatedAt,
    })
    .from(providerCredentials)
    .where(eq(providerCredentials.userId, session.user.id));

  const activeInstances = await db
    .select({ provider: instances.provider })
    .from(instances)
    .where(
      and(
        eq(instances.userId, session.user.id),
        ne(instances.status, "destroyed"),
      ),
    );

  const instanceCounts = new Map<string, number>();
  for (const inst of activeInstances) {
    instanceCounts.set(
      inst.provider,
      (instanceCounts.get(inst.provider) || 0) + 1,
    );
  }

  const connected = new Set(rows.map((r) => r.provider));

  const providers = Object.entries(PROVIDER_CREDENTIAL_FIELDS).map(
    ([name, config]) => ({
      provider: name,
      connected: connected.has(name),
      instanceCount: instanceCounts.get(name) || 0,
      updatedAt: rows.find((r) => r.provider === name)?.updatedAt ?? null,
      fields: config.fields,
      helpUrl: config.helpUrl,
    }),
  );

  return NextResponse.json(providers);
}

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
  const { provider, credentials } = body;

  if (!provider || !credentials || typeof credentials !== "object") {
    return NextResponse.json(
      { error: "provider and credentials are required" },
      { status: 400 },
    );
  }

  const config = PROVIDER_CREDENTIAL_FIELDS[provider];
  if (!config) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}` },
      { status: 400 },
    );
  }

  for (const field of config.fields) {
    if (
      !credentials[field.key] ||
      typeof credentials[field.key] !== "string" ||
      !credentials[field.key].trim()
    ) {
      return NextResponse.json(
        { error: `${field.label} is required` },
        { status: 400 },
      );
    }
  }

  // Validate credentials by making a lightweight API call to the provider
  try {
    const providerInstance = getProvider(provider, credentials);
    if (providerInstance.validateCredentials) {
      await providerInstance.validateCredentials();
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }

  const encryptedCredentials = encrypt(JSON.stringify(credentials));

  const [existing] = await db
    .select({ id: providerCredentials.id })
    .from(providerCredentials)
    .where(
      and(
        eq(providerCredentials.userId, session.user.id),
        eq(providerCredentials.provider, provider),
      ),
    );

  if (existing) {
    await db
      .update(providerCredentials)
      .set({ encryptedCredentials, updatedAt: new Date() })
      .where(eq(providerCredentials.id, existing.id));
  } else {
    await db.insert(providerCredentials).values({
      userId: session.user.id,
      provider,
      encryptedCredentials,
    });
  }

  return NextResponse.json({ provider, connected: true });
}
