import { db } from "@/lib/db";
import { instances } from "@/lib/db/schema";
import { eq, ne, and, desc } from "drizzle-orm";

export async function getInstancesForUser(userId: string) {
  return db
    .select()
    .from(instances)
    .where(and(eq(instances.userId, userId), ne(instances.status, "destroyed")))
    .orderBy(desc(instances.createdAt));
}

export async function getInstanceForUser(userId: string, instanceId: string) {
  const [inst] = await db
    .select()
    .from(instances)
    .where(and(eq(instances.id, instanceId), eq(instances.userId, userId)));
  return inst ?? null;
}
