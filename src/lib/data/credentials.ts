import { db } from "@/lib/db";
import { providerCredentials, instances } from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { PROVIDER_CREDENTIAL_FIELDS } from "@/lib/providers/types";

export async function getCredentialStatuses(userId: string) {
  const rows = await db
    .select({
      provider: providerCredentials.provider,
      updatedAt: providerCredentials.updatedAt,
    })
    .from(providerCredentials)
    .where(eq(providerCredentials.userId, userId));

  const activeInstances = await db
    .select({ provider: instances.provider })
    .from(instances)
    .where(
      and(eq(instances.userId, userId), ne(instances.status, "destroyed")),
    );

  const instanceCounts = new Map<string, number>();
  for (const inst of activeInstances) {
    instanceCounts.set(
      inst.provider,
      (instanceCounts.get(inst.provider) || 0) + 1,
    );
  }

  const connected = new Set(rows.map((r) => r.provider));

  return Object.entries(PROVIDER_CREDENTIAL_FIELDS).map(([name, config]) => ({
    provider: name,
    connected: connected.has(name),
    instanceCount: instanceCounts.get(name) || 0,
    updatedAt:
      rows.find((r) => r.provider === name)?.updatedAt?.toISOString() ?? null,
    fields: config.fields.map((f) => ({ key: f.key, label: f.label })),
    helpUrl: config.helpUrl,
  }));
}
