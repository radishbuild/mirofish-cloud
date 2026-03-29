import { randomBytes } from "crypto";
import { eq, and } from "drizzle-orm";
import type {
  DeployProvider,
  InstanceConfig,
  InstanceInfo,
  ProviderCredentials,
} from "./types";
import { RunPodProvider } from "./runpod";
import { VastaiProvider } from "./vastai";
import { db } from "@/lib/db";
import { providerCredentials } from "@/lib/db/schema";
import { decrypt } from "@/lib/crypto";

const CLOUD_PROVIDERS: Record<
  string,
  (creds: ProviderCredentials) => DeployProvider
> = {
  runpod: (c) => new RunPodProvider(c.apiKey!),
  vastai: (c) => new VastaiProvider(c.apiKey!),
};

export function getProvider(
  name: string,
  credentials: ProviderCredentials,
): DeployProvider {
  const factory = CLOUD_PROVIDERS[name];
  if (!factory) throw new Error(`Unknown provider: ${name}`);
  return factory(credentials);
}

export async function getProviderForUser(
  userId: string,
  providerName: string,
): Promise<DeployProvider> {
  const [row] = await db
    .select()
    .from(providerCredentials)
    .where(
      and(
        eq(providerCredentials.userId, userId),
        eq(providerCredentials.provider, providerName),
      ),
    );

  if (!row) {
    throw new Error(
      `No ${providerName} credentials found. Connect your account in Settings.`,
    );
  }

  let creds: ProviderCredentials;
  try {
    creds = JSON.parse(decrypt(row.encryptedCredentials));
  } catch {
    throw new Error(
      `Stored credentials corrupted. Reconnect your ${providerName} account in Settings.`,
    );
  }
  return getProvider(providerName, creds);
}

export function resolveProviderName(preferred?: string): string {
  if (preferred && preferred in CLOUD_PROVIDERS) return preferred;
  return "runpod";
}

export function resolveDockerImage(): string {
  return (
    process.env.DOCKER_IMAGE_GPU ||
    "ghcr.io/nikmcfly/mirofish-hosted-gpu:latest"
  );
}

export async function createInstance(
  providerName: string,
  config: InstanceConfig,
  userId: string,
): Promise<InstanceInfo> {
  config.dockerImage = resolveDockerImage();
  if (!config.neo4jPassword) {
    config.neo4jPassword = randomBytes(16).toString("hex");
  }
  const provider = await getProviderForUser(userId, providerName);
  return provider.createInstance(config);
}
