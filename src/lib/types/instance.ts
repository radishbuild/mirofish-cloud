export interface Instance {
  id: string;
  name: string | null;
  provider: string;
  providerInstanceId: string | null;
  instanceUrl: string | null;
  status: string;
  gpuType: string | null;
  ollamaModel: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  destroyedAt: string | null;
}

export interface CredentialStatus {
  provider: string;
  connected: boolean;
  instanceCount: number;
  updatedAt: string | null;
  fields: { key: string; label: string }[];
  helpUrl: string;
}
