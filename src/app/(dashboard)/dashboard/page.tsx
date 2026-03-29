import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getInstancesForUser } from "@/lib/data/instances";
import { INSTANCE_LIMITS } from "@/lib/plans";
import { InstanceList } from "@/components/dashboard/instance-list";

export const metadata = {
  title: "Instances",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const rows = await getInstancesForUser(session.user.id);

  // Serialize dates for client component
  const instances = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    lastActiveAt: r.lastActiveAt?.toISOString() ?? null,
    destroyedAt: r.destroyedAt?.toISOString() ?? null,
  }));

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <InstanceList
        initialInstances={instances}
        maxInstances={INSTANCE_LIMITS.maxInstances}
      />
    </div>
  );
}
