import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { providerCredentials } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PROVIDER_CREDENTIAL_FIELDS } from "@/lib/providers/types";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await params;

  if (!PROVIDER_CREDENTIAL_FIELDS[provider]) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}` },
      { status: 400 },
    );
  }

  await db
    .delete(providerCredentials)
    .where(
      and(
        eq(providerCredentials.userId, session.user.id),
        eq(providerCredentials.provider, provider),
      ),
    );

  return NextResponse.json({ provider, connected: false });
}
