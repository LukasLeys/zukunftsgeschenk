import type { ReactNode } from "react";
import { ShopChrome } from "@/components/ShopChrome";

/** Layout aller öffentlichen Seiten. Der Admin-Bereich liegt außerhalb dieser Gruppe und hat sein eigenes Layout. */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopChrome>{children}</ShopChrome>;
}
