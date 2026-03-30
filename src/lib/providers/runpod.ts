import { randomBytes } from "crypto";
import type {
  DeployProvider,
  GpuType,
  InstanceConfig,
  InstanceInfo,
} from "./types";

export class RunPodProvider implements DeployProvider {
  private url = "https://api.runpod.io/graphql";

  constructor(private apiKey: string) {
    if (!apiKey) throw new Error("RunPod API key is required");
  }

  private async gql(query: string, variables: Record<string, unknown> = {}) {
    // RunPod supports both Bearer header and ?api_key= query param
    const res = await fetch(`${this.url}?api_key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    if (data.errors)
      throw new Error(`RunPod API: ${JSON.stringify(data.errors)}`);
    return data.data;
  }

  async validateCredentials(): Promise<boolean> {
    const data = await this.gql(`{ myself { id } }`);
    if (!data?.myself?.id)
      throw new Error("Invalid RunPod API key — could not authenticate.");
    return true;
  }

  async listGpuTypes(): Promise<GpuType[]> {
    const data = await this.gql(`query {
      gpuTypes {
        id
        displayName
        memoryInGb
        securePrice
        secureCloud
        lowestPrice(input: { gpuCount: 1, secureCloud: true }) {
          stockStatus
        }
      }
    }`);

    const gpuTypes = (data.gpuTypes ?? []) as Array<{
      id: string;
      displayName: string;
      memoryInGb: number;
      securePrice: number | null;
      secureCloud: boolean;
      lowestPrice?: { stockStatus: string | null };
    }>;

    // stockStatus values from RunPod Secure Cloud:
    //   "High" = plenty of stock
    //   "Medium" = moderate stock
    //   "Low" = limited stock (may fail to provision)
    //   null = no stock
    return gpuTypes
      .filter((gpu) => gpu.securePrice != null && gpu.securePrice > 0)
      .map((gpu) => ({
        id: gpu.id,
        name: gpu.displayName,
        vramGb: gpu.memoryInGb,
        pricePerHour: gpu.securePrice!,
        available: gpu.secureCloud && gpu.lowestPrice?.stockStatus != null,
      }))
      .filter((gpu) => gpu.pricePerHour > 0)
      .sort((a, b) => a.pricePerHour - b.pricePerHour);
  }

  async createInstance(config: InstanceConfig): Promise<InstanceInfo> {
    const neo4jPass = config.neo4jPassword || randomBytes(16).toString("hex");

    const envVars = [
      { key: "LLM_MODE", value: "local" },
      { key: "LLM_API_KEY", value: "ollama" },
      { key: "LLM_BASE_URL", value: "http://localhost:11434/v1" },
      { key: "LLM_MODEL_NAME", value: config.ollamaModel },
      { key: "OLLAMA_MODEL", value: config.ollamaModel },
      { key: "OLLAMA_EMBED_MODEL", value: "nomic-embed-text" },
      { key: "NEO4J_URI", value: "bolt://localhost:7687" },
      { key: "NEO4J_USER", value: "neo4j" },
      { key: "NEO4J_PASSWORD", value: neo4jPass },
      { key: "NEO4J_AUTH", value: `neo4j/${neo4jPass}` },
      { key: "RUN_NEO4J_EMBEDDED", value: "true" },
    ];

    const podName = `mirofish-${config.instanceId.slice(0, 8)}`;

    const data = await this.gql(
      `mutation CreatePod($input: PodFindAndDeployOnDemandInput!) {
        podFindAndDeployOnDemand(input: $input) { id }
      }`,
      {
        input: {
          name: podName,
          imageName: config.dockerImage,
          gpuTypeId: config.gpuType,
          gpuCount: 1,
          volumeInGb: 50,
          containerDiskInGb: 20,
          ports: "3000/http",
          volumeMountPath: "/workspace",
          cloudType: "SECURE",
          env: envVars,
        },
      },
    );
    const podId = data.podFindAndDeployOnDemand.id;
    return {
      providerId: podId,
      url: `https://${podId}-3000.proxy.runpod.net`,
      status: "provisioning",
    };
  }

  async getStatus(providerId: string) {
    const data = await this.gql(
      `query GetPod($podId: String!) {
        pod(input: { podId: $podId }) {
          id desiredStatus
          runtime { uptimeInSeconds }
        }
      }`,
      { podId: providerId },
    );
    if (!data.pod) return "destroyed";
    const { desiredStatus, runtime } = data.pod;
    if (desiredStatus === "EXITED") return "stopped";
    if (desiredStatus === "RUNNING" && runtime && runtime.uptimeInSeconds > 0)
      return "running";
    return "provisioning";
  }

  async stopInstance(providerId: string) {
    await this.gql(
      `mutation StopPod($podId: String!) {
        podStop(input: { podId: $podId }) { id desiredStatus }
      }`,
      { podId: providerId },
    );
    return true;
  }

  async startInstance(providerId: string) {
    await this.gql(
      `mutation ResumePod($podId: String!, $gpuCount: Int!) {
        podResume(input: { podId: $podId, gpuCount: $gpuCount }) { id desiredStatus }
      }`,
      { podId: providerId, gpuCount: 1 },
    );
    return true;
  }

  async restartInstance(providerId: string) {
    await this.stopInstance(providerId);
    await this.startInstance(providerId);
    return true;
  }

  async destroyInstance(providerId: string) {
    try {
      await this.gql(
        `mutation TerminatePod($podId: String!) {
          podTerminate(input: { podId: $podId })
        }`,
        { podId: providerId },
      );
    } catch (e) {
      if (e instanceof Error && e.message.includes("pod not found")) {
        return true;
      }
      throw e;
    }
    return true;
  }
}
