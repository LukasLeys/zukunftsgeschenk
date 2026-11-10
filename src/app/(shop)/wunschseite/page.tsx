import type { Metadata } from "next";
import { GiftCard } from "@/components/GiftCard";
import { WishForm } from "@/components/eltern/WishForm";
import s from "@/components/eltern/eltern.module.css";
import { ibanFeaturesReady, IBAN_NOT_READY } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wunschseite anlegen",
  description:
    "Für Eltern: ein Link für die ganze Familie. Wer über eure Wunschseite schenkt, braucht keinen Einlösecode. Das Geld kommt per Bank-QR-Code direkt auf euer Konto.",
};

export default function WunschseitePage() {
  return (
    <div className={`band ${s.page}`}>
      <div className={`wrap ${s.flow}`}>
        <div className={`${s.split} ${s.splitWide}`}>
          <div className={`paper ${s.sheet}`}>
            <h1 className={s.h1}>Eine Wunschseite für euer Kind</h1>
            <p className="lead">
              Ein Link für die ganze Familie. Schickt ihn an Großeltern, Paten und Freunde. Wer darüber schenkt, braucht keinen
              Einlösecode. Eure Bankverbindung ist schon hinterlegt, und das Geld kommt per Bank-QR-Code direkt auf euer Konto.
            </p>
            <p className={s.p}>
              Die Familie kann eine Karte gestalten oder ohne Karte direkt überweisen. Das Anlegen kostet nichts und dauert etwa
              zwei Minuten.
            </p>
            <p className={s.p}>Die Seite wird nach 12 Monaten automatisch gelöscht. Ihr könnt sie jederzeit vorher löschen.</p>
            {!ibanFeaturesReady() && (
              <p className="info-line" role="status" style={{ marginBlock: 16 }}>
                {IBAN_NOT_READY}
              </p>
            )}
            <WishForm />
          </div>
          <div className={`${s.cardStage} ${s.hideMobile}`} aria-hidden="true">
            <GiftCard motif="mobile" paper="rosa" amount={100} childName="Lena" sender="Von Oma und Opa" size="md" decorative />
          </div>
        </div>
      </div>
    </div>
  );
}
