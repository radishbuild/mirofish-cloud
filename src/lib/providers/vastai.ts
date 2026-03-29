import type {
  DeployProvider,
  GpuType,
  InstanceConfig,
  InstanceInfo,
} from "./types";

// Vast.ai API: https://docs.vast.ai/api-reference/
// Base: https://console.vast.ai/api/v0
// Instance response fields (from actual API response):
//   actual_status: "running" | "loading" | "creating" | "exited" | "stopped"
//   public_ipaddr: "143.55.45.86"
//   ports: { "3000/tcp": [{ "HostIp": "0.0.0.0", "HostPort": "42663" }] }
//   ssh_port: null (not reliable)

export class VastaiProvider implements DeployProvider {
  private baseUrl = "https://console.vast.ai/api/v0";
  // Cache last fetched instance data so getInstanceUrl doesn't need a second API call
  private cachedInstance: Record<string, unknown> | null = null;

  constructor(private apiKey: string) {
    if (!apiKey) throw new Error("Vast.ai API key is required");
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Vast.ai API error (${res.status}): ${text.slice(0, 200)}`,
      );
    }
    const contentLength = res.headers.get("content-length");
    if (contentLength === "0") return {};
    return res.json();
  }

  async validateCredentials(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/instances/`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok)
      throw new Error("Invalid Vast.ai credentials — could not authenticate.");
    return true;
  }

  async listGpuTypes(): Promise<GpuType[]> {
    const data = (await this.request("POST", "/bundles/", {
      rentable: { eq: true },
      datacenter: { eq: true },
      reliability: { gte: 0.95 },
      inet_down: { gte: 200 },
      disk_bw: { gte: 200 },
      order: [["dph_total", "asc"]],
      limit: 500,
      type: "ondemand",
    })) as { offers?: Array<Record<string, unknown>> };

    const seen = new Map<string, GpuType>();
    for (const offer of data.offers ?? []) {
      const gpuName = offer.gpu_name as string | undefined;
      const dphTotal = offer.dph_total as number | undefined;
      const gpuRam = offer.gpu_ram as number | undefined;
      if (!gpuName || dphTotal == null || dphTotal <= 0) continue;
      if (!seen.has(gpuName)) {
        seen.set(gpuName, {
          id: gpuName,
          name: gpuName,
          vramGb: gpuRam ? Math.round(gpuRam / 1024) : 0,
          pricePerHour: Math.round(dphTotal * 100) / 100,
          available: true,
        });
      }
    }
    return Array.from(seen.values()).sort(
      (a, b) => a.pricePerHour - b.pricePerHour,
    );
  }

  async createInstance(config: InstanceConfig): Promise<InstanceInfo> {
    const offers = (await this.request("POST", "/bundles/", {
      rentable: { eq: true },
      datacenter: { eq: true },
      reliability: { gte: 0.95 },
      inet_down: { gte: 200 },
      disk_bw: { gte: 200 },
      gpu_name: { eq: config.gpuType },
      order: [["dph_total", "asc"]],
      limit: 300,
      type: "ondemand",
    })) as { offers?: Array<Record<string, unknown>> };

    const offerList = offers.offers ?? [];
    if (offerList.length === 0) {
      throw new Error(
        `No Vast.ai GPU offers found for ${config.gpuType}. Try a different GPU type.`,
      );
    }

    const offerId = offerList[0].id as number;

    const data = await this.request("PUT", `/asks/${offerId}/`, {
      image: config.dockerImage,
      disk: 50,
      label: `mirofish-${config.instanceId.slice(0, 8)}`,
      onstart: "",
      runtype: "args",
      env: {
        LLM_MODE: "local",
        LLM_API_KEY: "ollama",
        LLM_BASE_URL: "http://localhost:11434/v1",
        LLM_MODEL_NAME: config.ollamaModel,
        OLLAMA_MODEL: config.ollamaModel,
        OLLAMA_EMBED_MODEL: "nomic-embed-text",
        EMBEDDING_MODEL: "nomic-embed-text",
        EMBEDDING_BASE_URL: "http://localhost:11434",
        NEO4J_URI: "bolt://localhost:7687",
        NEO4J_USER: "neo4j",
        NEO4J_PASSWORD: config.neo4jPassword,
        NEO4J_AUTH: `neo4j/${config.neo4jPassword}`,
        OPENAI_API_KEY: "ollama",
        OPENAI_API_BASE_URL: "http://localhost:11434/v1",
        "-p 3000:3000": "1",
      },
    });

    const contractId = data.new_contract as number | string;
    if (!contractId) {
      throw new Error(
        "Vast.ai instance creation failed — no contract ID returned.",
      );
    }

    return {
      providerId: String(contractId),
      url: "",
      status: "provisioning",
    };
  }

  // Fetches instance data once — caches it for getInstanceUrl
  async getStatus(providerId: string): Promise<string> {
    try {
      const resp = await this.request("GET", `/instances/${providerId}/`);
      this.cachedInstance = resp;
      const status = resp.actual_status as string | undefined;
      if (status === "running") return "running";
      if (status === "exited" || status === "stopped") return "stopped";
      if (status === "loading" || status === "creating") return "provisioning";
      return "provisioning";
    } catch (e) {
      console.error("Vast.ai status check failed:", e);
      return "unknown";
    }
  }

  // Reads from cached instance data — call getStatus first
  async getInstanceUrl(): Promise<string | null> {
    const resp = this.cachedInstance;
    if (!resp) return null;
    const ip = resp.public_ipaddr as string | undefined;
    const ports = resp.ports as Record<
      string,
      Array<{ HostIp: string; HostPort: string }>
    > | null;
    if (!ip || !ports?.["3000/tcp"]?.[0]?.HostPort) return null;
    return `http://${ip}:${ports["3000/tcp"][0].HostPort}`;
  }

  async stopInstance(providerId: string): Promise<boolean> {
    await this.request("PUT", `/instances/${providerId}/`, {
      target_state: "stopped",
    });
    return true;
  }

  async startInstance(providerId: string): Promise<boolean> {
    await this.request("PUT", `/instances/${providerId}/`, {
      target_state: "running",
    });
    return true;
  }

  async restartInstance(providerId: string): Promise<boolean> {
    await this.request("POST", `/instances/${providerId}/reboot/`);
    return true;
  }

  async destroyInstance(providerId: string): Promise<boolean> {
    try {
      await this.request("DELETE", `/instances/${providerId}/`);
    } catch (e) {
      if (e instanceof Error && e.message.includes("no_such_instance")) {
        return true;
      }
      throw e;
    }
    return true;
  }
}
