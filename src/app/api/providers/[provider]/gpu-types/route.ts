import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProviderForUser } from "@/lib/providers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider: providerName } = await params;

  try {
    const provider = await getProviderForUser(session.user.id, providerName);
    if (!provider.listGpuTypes) {
      return NextResponse.json(
        { error: "Provider does not support GPU listing" },
        { status: 400 },
      );
    }
    const gpuTypes = await provider.listGpuTypes();
    return NextResponse.json(gpuTypes);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch GPU types" },
      { status: 502 },
    );
  }
}
