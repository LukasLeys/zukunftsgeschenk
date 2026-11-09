import { Icon } from "@/components/Icon";
import { InfoIcon } from "./InfoIcon";
import s from "./info.module.css";

/**
 * Grafik zum Geldfluss in zwei Wegen:
 * Weg 1: Kartenpreis an uns. Weg 2: Geschenkbetrag per Bank-QR direkt an die Eltern, die ins Depot einzahlen.
 */
export function MoneyFlow({ cardPrice, giftAmount }: { cardPrice: string; giftAmount: string }) {
  return (
    <figure className={s.flow} aria-labelledby="flow-cap">
      <div className={s.lane}>
        <p className={s.laneHead}>
          <b>Weg 1: der Kartenpreis</b>
          <span>Das ist alles, was du an uns bezahlst.</span>
        </p>
        <ol className={s.laneRow}>
          <li className={s.node}>
            <span className={s.nodeIc}>
              <InfoIcon name="person" />
            </span>
            <div>
              <b>Du</b>
              <span>kaufst die Karte im Shop</span>
            </div>
          </li>
          <li className={s.arrow}>
            <span className={s.arrowLabel}>Kartenpreis, z. B. {cardPrice}</span>
            <span className={s.arrowLine} aria-hidden="true" />
          </li>
          <li className={`${s.node} ${s.nodeUs}`}>
            <span className={s.nodeIc}>
              <Icon name="env" />
            </span>
            <div>
              <b>Zukunftsgeschenk</b>
              <span>gestaltet, druckt und verschickt die Karte</span>
            </div>
          </li>
          <li className={s.laneEnd}>Hier endet der Weg. Das Geschenkgeld kommt bei uns nie an.</li>
        </ol>
      </div>

      <div className={s.lane}>
        <p className={s.laneHead}>
          <b>Weg 2: das Geschenk</b>
          <span>Der Betrag auf der Karte geht direkt an die Eltern.</span>
        </p>
        <ol className={s.laneRow}>
          <li className={s.node}>
            <span className={s.nodeIc}>
              <InfoIcon name="person" />
            </span>
            <div>
              <b>Du</b>
              <span>scannst den Bank-QR-Code in deiner Banking-App</span>
            </div>
          </li>
          <li className={`${s.arrow} ${s.arrowGift}`}>
            <span className={s.arrowLabel}>Geschenkbetrag, z. B. {giftAmount}, per Überweisung</span>
            <span className={s.arrowLine} aria-hidden="true" />
          </li>
          <li className={s.node}>
            <span className={s.nodeIc}>
              <InfoIcon name="home" />
            </span>
            <div>
              <b>Eltern</b>
              <span>bekommen das Geld auf ihr eigenes Konto</span>
            </div>
          </li>
          <li className={`${s.arrow} ${s.arrowGift}`}>
            <span className={s.arrowLabel}>Einzahlung voraussichtlich ab Juli 2027</span>
            <span className={s.arrowLine} aria-hidden="true" />
          </li>
          <li className={`${s.node} ${s.nodeDepot}`}>
            <span className={s.nodeIc}>
              <InfoIcon name="depot" />
            </span>
            <div>
              <b>Zukunftsdepot</b>
              <span>auf den Namen des Kindes, gesperrt bis 18</span>
            </div>
          </li>
        </ol>
      </div>
      <figcaption id="flow-cap" className={s.flowCap}>
        Der Geldfluss im Überblick. Bei uns bezahlst du nur die Karte. Den Geschenkbetrag überweist du selbst an die Eltern,
        und nur die Eltern zahlen ins Zukunftsdepot ein.
      </figcaption>
    </figure>
  );
}

export default MoneyFlow;
