import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCredentialStatuses } from "@/lib/data/credentials";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const statuses = await getCredentialStatuses(session.user.id);

  const statusMap: Record<string, boolean> = {};
  for (const s of statuses) {
    statusMap[s.provider] = s.connected;
  }

  return <SettingsPanel initialStatuses={statusMap} />;
}
