import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCredentialStatuses } from "@/lib/data/credentials";
import { CreateInstanceForm } from "@/components/dashboard/create-instance-form";

export const metadata = {
  title: "Create Instance",
};

export default async function NewInstancePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const statuses = await getCredentialStatuses(session.user.id);

  const connectedProviders = new Set(
    statuses.filter((s) => s.connected).map((s) => s.provider),
  );

  return <CreateInstanceForm initialConnectedProviders={connectedProviders} />;
}
