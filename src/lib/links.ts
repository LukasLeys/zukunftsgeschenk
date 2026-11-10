import { SITE_URL } from "./env";
import type { Order } from "./db/schema";

type OrderRef = Pick<Order, "id" | "accessToken">;

/** Bestellseite mit Zugriffsschlüssel. */
export const orderPath = (o: OrderRef) => `/bestellung/${o.id}?t=${o.accessToken}`;
export const orderUrl = (o: OrderRef) => `${SITE_URL}${orderPath(o)}`;

/** Rechnung als PDF, geschützt mit demselben Schlüssel wie die Bestellseite. */
export const invoicePath = (o: OrderRef) => `/api/bestellung/${o.id}/rechnung?t=${o.accessToken}`;
export const invoiceUrl = (o: OrderRef) => `${SITE_URL}${invoicePath(o)}`;
