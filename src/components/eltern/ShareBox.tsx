"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { CopyButton } from "./CopyButton";
import s from "./eltern.module.css";

/** Hinweis für Eltern direkt nach dem Anlegen: Link teilen. */
export function ShareBox({ path, childName, fallbackOrigin }: { path: string; childName: string; fallbackOrigin: string }) {
  const [url, setUrl] = useState(`${fallbackOrigin}${path}`);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setCanShare(typeof navigator.share === "function");
  }, [path]);

  return (
    <section className={s.share} aria-labelledby="share-h">
      <h2 id="share-h">Eure Seite ist online. Jetzt den Link teilen.</h2>
      <p className="small">
        Schickt den Link per WhatsApp, SMS oder E-Mail an die Familie. Nur wer den Link hat, findet die Seite.
      </p>
      <div className={s.shareRow}>
        <span className={s.shareUrl} id="share-url">
          {url}
        </span>
        <CopyButton value={url} targetId="share-url" label="Link" />
        {canShare ? (
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              navigator.share({ title: `Ein Stück Zukunft für ${childName}`, url }).catch(() => {});
            }}
          >
            Teilen <Icon name="arrow" />
          </button>
        ) : null}
      </div>
      <p className="small muted">
        Wir haben euch eine E-Mail mit dem Link zum Bearbeiten geschickt. Hebt sie gut auf. Damit könnt ihr Nachricht und Anlass
        ändern oder die Seite löschen.
      </p>
    </section>
  );
}
