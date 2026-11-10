import type { Metadata } from "next";
import { RedeemFlow } from "@/components/eltern/RedeemFlow";
import s from "@/components/eltern/eltern.module.css";
import { ibanFeaturesReady, IBAN_NOT_READY } from "@/lib/crypto";

export const metadata: Metadata = {
  title: "Karte einlösen",
  description:
    "Für Eltern: Einlösecode von der Geschenkkarte eingeben und IBAN hinterlegen. Das Geld überweisen die Schenkenden direkt an euch, nie über uns.",
};

export default async function EinloesenPage({ searchParams }: { searchParams: Promise<{ code?: string | string[] }> }) {
  const sp = await searchParams;
  const code = (Array.isArray(sp.code) ? sp.code[0] : sp.code) ?? "";
  return (
    <div className={`band ${s.page}`}>
      <div className="wrap">
        {!ibanFeaturesReady() && (
          <p className="info-line" role="status" style={{ marginBottom: 20 }}>
            {IBAN_NOT_READY}
          </p>
        )}
        <RedeemFlow initialCode={code.slice(0, 20)} />
      </div>
    </div>
  );
}
