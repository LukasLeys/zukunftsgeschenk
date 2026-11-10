import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { transferInfo } from "@/lib/shop";
import { UserError } from "@/lib/errors";
import { qrSvg } from "@/lib/qr";
import { formatIban, normalizeIban } from "@/lib/iban";
import type { Paper } from "@/lib/catalog";
import { GiftCard } from "@/components/GiftCard";
import { Icon } from "@/components/Icon";
import { eur, fmtNumber } from "@/components/format";
import { CopyButton } from "@/components/eltern/CopyButton";
import { TransferConfirm } from "@/components/eltern/TransferConfirm";
import s from "@/components/eltern/eltern.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Geschenk überweisen",
  robots: { index: false, follow: false },
};

async function load(token: string) {
  try {
    return await transferInfo(token);
  } catch (e) {
    // Dienst noch nicht freigeschaltet (zum Beispiel ohne IBAN-Schlüssel): klare Meldung über die Fehlerseite statt 404.
    if (e instanceof UserError && e.status === 503) throw e;
    return null;
  }
}

const dateAT = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "long", year: "numeric" }).format(d) : null;

export default async function UeberweisenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await load(token);
  if (!info) notFound();

  const { card, iban, recipient, remittance } = info;
  const amount = card.amountCents / 100;
  const amountText = eur(amount, amount % 1 ? 2 : 0);
  const svg = await qrSvg(info.epc, { margin: 0 });
  const redeemed = dateAT(card.redeemedAt);

  const rows = [
    { id: "t-name", dt: "Empfänger", dd: recipient, copy: recipient },
    { id: "t-iban", dt: "IBAN", dd: formatIban(iban), copy: normalizeIban(iban), mono: true },
    { id: "t-amt", dt: "Betrag", dd: amountText, copy: fmtNumber(amount, 2) },
    { id: "t-ref", dt: "Verwendungszweck", dd: remittance, copy: remittance },
  ];

  const pending = (
    <div className={s.pendingFlow}>
      <h1 className={s.h1} tabIndex={-1}>
        Jetzt {amountText} an {recipient} überweisen
      </h1>
      <p className="lead">
        Die Eltern von {card.childName} haben deine Karte eingelöst
        {redeemed ? ` (am ${redeemed})` : ""}. Jetzt fehlt nur noch die Überweisung. Mit dem Bank-QR-Code sind alle Angaben schon
        ausgefüllt.
      </p>

      <div className={s.qrBlock}>
        <div className={s.qr} role="img" aria-label={`Bank-QR-Code: ${amountText} an ${recipient}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <h2 className={s.h3}>So geht es mit dem QR-Code</h2>
          <ol className={s.how}>
            <li>
              <span aria-hidden="true">1</span>
              <span>Banking-App am Handy öffnen, zum Beispiel George.</span>
            </li>
            <li>
              <span aria-hidden="true">2</span>
              <span>In der App die QR-Code-Funktion wählen und diesen Code scannen.</span>
            </li>
            <li>
              <span aria-hidden="true">3</span>
              <span>Angaben prüfen und die Überweisung bestätigen.</span>
            </li>
          </ol>
          <p className={s.mobileHint}>
            Den QR-Code scannst du mit dem Handy, wenn diese Seite am Computer oder Tablet offen ist. Am Handy nimmst du die Angaben
            zum Kopieren.
          </p>
        </div>
      </div>

      <h2 className={`${s.h3} ${s.manualHead}`}>
        Die Angaben zum Überweisen
      </h2>
      <dl className={s.manual}>
        {rows.map((r) => (
          <div key={r.id}>
            <dt>{r.dt}</dt>
            <dd id={r.id} className={r.mono ? s.mono : undefined}>
              {r.dd}
            </dd>
            <CopyButton value={r.copy} targetId={r.id} label={r.dt} />
          </div>
        ))}
      </dl>

      <p className={s.directNote}>
        <Icon name="direct" />
        <span>
          Das Geld geht direkt an die Eltern. Es fließt nie über uns. Wir sehen die Überweisung nicht und erfahren nur, wenn du
          sie hier meldest.
        </span>
      </p>
    </div>
  );

  const thanks = (
    <>
      <span className={s.doneSeal} aria-hidden="true">
        <Icon name="check" />
      </span>
      <h1 className={s.h1} tabIndex={-1}>
        Danke! Dein Geschenk ist unterwegs.
      </h1>
      <p className="lead">
        Du hast die Überweisung über {amountText} an {recipient} gemeldet. Wir haben den Eltern Bescheid gesagt.
        Voraussichtlich ab Juli 2027 können sie das Geld ins Zukunftsdepot von {card.childName} einzahlen.
      </p>
      <p className={s.p}>
        Eine Überweisung dauert meist einen Bankarbeitstag. Falls etwas schiefgegangen ist, kannst du diesen Link später noch
        einmal öffnen. Die Angaben bleiben bis zu 90 Tage nach dem Einlösen hier.
      </p>
      <div className="buy-row">
        <Link className="btn" href="/karten">
          Noch eine Karte verschenken <Icon name="arrow" />
        </Link>
      </div>
    </>
  );

  return (
    <div className={`band ${s.page}`}>
      <div className={`wrap ${s.flow}`}>
        <div className={`${s.split} ${s.splitWide}`}>
          <div className={`paper ${s.sheet}`}>
            <TransferConfirm token={token} initialDone={card.status === "transferred"} pending={pending} thanks={thanks} />
          </div>
          <aside className={s.aside} aria-label="Deine Karte">
            <div className={s.asideStage}>
              <GiftCard
                motif={card.motif}
                paper={card.paper as Paper}
                amount={amount}
                childName={card.childName}
                sender={card.sender}
                message={card.message}
                size="sm"
              />
            </div>
            <p className={s.asideText}>
              Deine Karte für {card.childName}. Den Kartenpreis hast du schon bezahlt. Der Betrag geht als Geschenk an die Eltern.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
