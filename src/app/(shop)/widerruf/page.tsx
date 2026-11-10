import type { Metadata } from "next";
import Link from "next/link";
import { InfoBody, List, Note, PageIntro, Section, infoStyles as s } from "@/components/info/InfoPage";
import { Co, CoNameAddress, DraftBox, legalTag, showOptional } from "@/components/info/Legal";
// Firmendaten kommen zur Laufzeit aus Umgebungsvariablen. Deshalb wird die Seite bei jedem Aufruf erzeugt.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description:
    "Widerrufsbelehrung nach dem Fern- und Auswärtsgeschäfte-Gesetz (FAGG) mit den Ausnahmen für personalisierte Karten und Muster-Widerrufsformular.",
};

const TOC = [
  { id: "kurz", label: "Auf einen Blick" },
  { id: "recht", label: "Widerrufsrecht" },
  { id: "folgen", label: "Folgen des Widerrufs" },
  { id: "ausnahmen", label: "Ausnahmen" },
  { id: "formular", label: "Muster-Widerrufsformular" },
];

export default function WiderrufPage() {
  return (
    <>
      <PageIntro
        title={"Widerrufs\u00adbelehrung"}
        lead="Als Verbraucherin oder Verbraucher haben Sie bei Online-Käufen grundsätzlich ein Widerrufsrecht nach dem Fern- und Auswärtsgeschäfte-Gesetz (FAGG). Für personalisierte Karten gelten gesetzliche Ausnahmen."
        tag={legalTag()}
      />
      <InfoBody legal before={<DraftBox />} toc={TOC}>
        <Section id="kurz" title="Auf einen Blick">
          <List>
            <li>
              <b>Gedruckte Karten</b> werden nach Ihren Angaben gestaltet, mit Name, Betrag und Botschaft. Dafür besteht
              kein Widerrufsrecht (§ 18 Abs. 1 Z 3 FAGG).
            </li>
            <li>
              <b>E-Mail-Karten (PDF)</b> sind digitale Inhalte. Wir erstellen sie sofort nach dem Kauf. Das Widerrufsrecht
              erlischt, wenn Sie dem in der Kasse ausdrücklich zustimmen (§ 18 Abs. 1 Z 11 FAGG).
            </li>
            <li>
              Ihre gesetzlichen Gewährleistungsrechte bleiben immer bestehen. Ist eine Karte fehlerhaft, drucken oder senden
              wir sie neu.
            </li>
            <li>Der Geschenkbetrag läuft nicht über uns und ist von einem Widerruf nicht berührt.</li>
          </List>
        </Section>

        <Section id="recht" title="Widerrufsrecht">
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen, soweit keine
            der unten genannten Ausnahmen gilt. Das FAGG nennt dieses Recht Rücktrittsrecht. In der Kasse und in unseren AGB
            verwenden wir diesen Begriff. Gemeint ist dasselbe Recht.
          </p>
          <p>
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht
            der Beförderer ist, die Ware in Besitz genommen haben. Bei Verträgen über digitale Inhalte, die nicht auf einem
            körperlichen Datenträger geliefert werden, beginnt die Frist mit dem Tag des Vertragsabschlusses.
          </p>
          <p>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (<CoNameAddress />, E-Mail: <Co k="email" link="mailto" />
            {showOptional("phone") ? <>, Telefon: <Co k="phone" link="tel" /></> : null}) mittels einer eindeutigen Erklärung, zum Beispiel
            einem mit der Post versandten Brief oder einer E-Mail, über Ihren Entschluss informieren, diesen Vertrag zu
            widerrufen. Sie können dafür das unten stehende Muster-Widerrufsformular verwenden, das jedoch nicht
            vorgeschrieben ist.
          </p>
          <p>
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor
            Ablauf der Widerrufsfrist absenden.
          </p>
        </Section>

        <Section id="folgen" title="Folgen des Widerrufs">
          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
            einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine
            andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und
            spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
            Vertrags bei uns eingegangen ist.
          </p>
          <p>
            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt
            haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart. In keinem Fall werden Ihnen wegen dieser
            Rückzahlung Entgelte berechnet.
          </p>
          <p>
            Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis
            erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
          </p>
          <p>
            Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über
            den Widerruf dieses Vertrags unterrichten, an <CoNameAddress /> zurückzusenden oder zu übergeben. Die
            Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die
            unmittelbaren Kosten der Rücksendung der Waren.
          </p>
          <p>
            Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung
            der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
          </p>
          <p>
            Mit dem Widerruf wird der Einlösecode der Karte ungültig.
          </p>
        </Section>

        <Section id="ausnahmen" title="Ausnahmen vom Widerrufsrecht">
          <h3>Gedruckte Karten</h3>
          <p>
            Das Widerrufsrecht besteht nicht bei Verträgen über Waren, die nach Kundenspezifikationen angefertigt werden oder
            eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind (§ 18 Abs. 1 Z 3 FAGG). Unsere gedruckten Karten
            werden mit dem Namen des Kindes, dem Geschenkbetrag, Ihrer Botschaft und einem persönlichen Einlösecode für Sie
            angefertigt. Für sie besteht daher kein Widerrufsrecht.
          </p>
          <h3>E-Mail-Karten</h3>
          <p>
            Bei digitalen Inhalten, die nicht auf einem körperlichen Datenträger geliefert werden, erlischt das
            Widerrufsrecht, wenn wir mit der Lieferung vor Ablauf der Widerrufsfrist begonnen haben, nachdem Sie
            ausdrücklich zugestimmt und bestätigt haben, dass Sie dadurch Ihr Widerrufsrecht verlieren, und wir Ihnen eine
            Bestätigung des Vertrags übermittelt haben (§ 18 Abs. 1 Z 11 FAGG).
          </p>
          <p>
            Wir erstellen die E-Mail-Karte sofort nach dem Kauf. Sie steht gleich als PDF in Ihrer Bestellübersicht bereit,
            auch wenn Sie für den Versand an die Empfänger einen späteren Wunschtermin wählen.
          </p>
          <Note tone="rosa">
            <p>
              Ist eine E-Mail-Karte im Warenkorb, bestätigen Sie in der Kasse mit einem eigenen Häkchen diesen Satz: „Ich stimme zu, dass ihr die digitale Karte sofort erstellt und zum gewählten Termin
              versendet. Mir ist bekannt, dass ich damit mein Rücktrittsrecht für diese Karte verliere.“ Ohne dieses Häkchen
              ist die Bestellung nicht möglich. Ihre Zustimmung speichern wir mit der Bestellung und wiederholen sie in der
              Bestellbestätigung per E-Mail.
            </p>
          </Note>
        </Section>

        <Section id="formular" title="Muster-Widerrufsformular">
          <p>
            Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück. Eine
            formlose E-Mail reicht ebenso.
          </p>
          <div className={s.form}>
            <p>
              An <CoNameAddress />, E-Mail: <Co k="email" />
            </p>
            <p>
              Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren
              (*) / die Erbringung der folgenden Dienstleistung (*):
            </p>
            <p aria-hidden="true">
              <span className={s.formLine} />
            </p>
            <p>
              Bestellt am (*) / erhalten am (*): <span className={s.formLine} aria-hidden="true" />
            </p>
            <p>
              Name des/der Verbraucher(s): <span className={s.formLine} aria-hidden="true" />
            </p>
            <p>
              Anschrift des/der Verbraucher(s): <span className={s.formLine} aria-hidden="true" />
            </p>
            <p>
              Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): <span className={s.formLine} aria-hidden="true" />
            </p>
            <p>
              Datum: <span className={s.formLine} aria-hidden="true" />
            </p>
            <p className="tiny">(*) Unzutreffendes streichen.</p>
          </div>
          <p style={{ marginTop: 18 }}>
            Weitere Rechtstexte: <Link href="/agb">AGB</Link>, <Link href="/datenschutz">Datenschutz</Link>,{" "}
            <Link href="/impressum">Impressum</Link>.
          </p>
        </Section>
      </InfoBody>
    </>
  );
}
