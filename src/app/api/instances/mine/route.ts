import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { eq, ne, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(instances)
    .where(
      and(
        eq(instances.userId, session.user.id),
        ne(instances.status, "destroyed"),
      ),
    )
    .orderBy(desc(instances.createdAt));

  return NextResponse.json(rows);
}
