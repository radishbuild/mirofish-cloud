export interface GpuType {
  id: string;
  name: string;
  vramGb: number;
  pricePerHour: number;
  available: boolean;
}

export interface InstanceConfig {
  userId: string;
  instanceId: string;
  ollamaModel: string;
  gpuType: string;
  neo4jPassword: string;
  dockerImage: string;
}

export interface InstanceInfo {
  providerId: string;
  url: string;
  status: string;
}

export interface ProviderCredentials {
  token?: string;
  apiKey?: string;
  tokenId?: string;
  tokenSecret?: string;
}

export const PROVIDER_CREDENTIAL_FIELDS: Record<
  string,
  {
    fields: { key: keyof ProviderCredentials; label: string }[];
    helpUrl: string;
  }
> = {
  runpod: {
    fields: [{ key: "apiKey", label: "API Key" }],
    helpUrl: "https://www.console.runpod.io/user/settings",
  },
  vastai: {
    fields: [{ key: "apiKey", label: "API Key" }],
    helpUrl: "https://cloud.vast.ai/manage-keys/",
  },
};

export interface DeployProvider {
  createInstance(config: InstanceConfig): Promise<InstanceInfo>;
  getStatus(providerId: string): Promise<string>;
  stopInstance(providerId: string): Promise<boolean>;
  startInstance(providerId: string): Promise<boolean>;
  restartInstance(providerId: string): Promise<boolean>;
  destroyInstance(providerId: string): Promise<boolean>;
  getInstanceUrl?(providerId: string): Promise<string | null>;
  validateCredentials?(): Promise<boolean>;
  listGpuTypes?(): Promise<GpuType[]>;
}
