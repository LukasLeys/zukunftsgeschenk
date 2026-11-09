"use client";

import { useEffect, useState } from "react";
import { AmountPicker } from "@/components/AmountPicker";
import { eur } from "@/components/format";
import s from "./eltern.module.css";

/** Direkt überweisen ohne Karte: Betrag und Absender wählen, Bank-QR-Code wird live erzeugt. */
export function WishDirect({ slug, childName, parentName }: { slug: string; childName: string; parentName: string }) {
  const [amount, setAmount] = useState(100);
  const [amountErr, setAmountErr] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [src, setSrc] = useState(() => `/api/wunschseite/${encodeURIComponent(slug)}/qr?betrag=100&von=`);
  const [loading, setLoading] = useState(false);

  // Absender verzögert übernehmen, damit nicht bei jedem Tastendruck ein neuer QR-Code geladen wird
  useEffect(() => {
    const t = setTimeout(() => {
      const next = `/api/wunschseite/${encodeURIComponent(slug)}/qr?betrag=${amount}&von=${encodeURIComponent(from.trim().slice(0, 40))}`;
      setSrc((cur) => {
        if (cur !== next) setLoading(true);
        return next;
      });
    }, 450);
    return () => clearTimeout(t);
  }, [amount, from, slug]);

  return (
    <div className={s.directForm}>
      <AmountPicker id="wd" value={amount} onChange={setAmount} onErrorChange={setAmountErr} legend="Wie viel möchtest du schenken?" />
      <div className={s.field}>
        <label className="lab" htmlFor="wd-from">
          Von wem?
        </label>
        <input
          id="wd-from"
          className="field"
          value={from}
          maxLength={40}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Zum Beispiel Oma Gerti"
          autoComplete="off"
          aria-describedby="wd-from-hint"
        />
        <p className="hint" id="wd-from-hint">
          Steht im Verwendungszweck. So wissen die Eltern, von wem das Geld kommt.
        </p>
      </div>
      <div className={s.directQr} aria-live="polite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`${s.qr} ${loading || amountErr ? s.qrLoading : ""}`}
          src={src}
          width={260}
          height={260}
          alt={`Bank-QR-Code: ${eur(amount)} an ${parentName}`}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
        <div>
          <p className={`${s.p} ${s.pFlush}`}>
            <b>
              {eur(amount)} für {childName}
            </b>
            <br />
            Banking-App öffnen, zum Beispiel George. Dann den QR-Code scannen und die Überweisung bestätigen. Das Geld geht direkt
            an {parentName}, nie über uns.
          </p>
          {amountErr ? <p className="err">Bitte zuerst einen gültigen Betrag wählen.</p> : null}
        </div>
      </div>
    </div>
  );
}
