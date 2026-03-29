import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getInstanceForUser } from "@/lib/data/instances";
import { InstanceDetail } from "@/components/dashboard/instance-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { title: "Instance" };

  const inst = await getInstanceForUser(session.user.id, id);
  return { title: inst?.name || "Instance" };
}

export default async function InstanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const inst = await getInstanceForUser(session.user.id, id);
  if (!inst) notFound();

  const serialized = {
    ...inst,
    createdAt: inst.createdAt.toISOString(),
    lastActiveAt: inst.lastActiveAt?.toISOString() ?? null,
    destroyedAt: inst.destroyedAt?.toISOString() ?? null,
  };

  return <InstanceDetail initialInstance={serialized} />;
}
