import Link from "next/link";
import { PageHead } from "@/components/admin/ui";

/** Nicht gefunden innerhalb des Admin-Bereichs: bleibt im Admin-Rahmen, ohne Shop-Kopf. */
export default function AdminNotFound() {
  return (
    <PageHead title="Nicht gefunden" sub="Diesen Eintrag gibt es nicht oder nicht mehr.">
      <Link href="/admin/bestellungen">Zu den Bestellungen</Link>
    </PageHead>
  );
}
