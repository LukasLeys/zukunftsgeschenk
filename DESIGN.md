---
name: Zukunftsgeschenk
description: Geschenkkarten fürs Zukunftsdepot, als Shop, der sich wie ein Geschenk auspackt.
colors:
  geschenkpapier-pink: "#d81b6a"
  pink-tief: "#b3124f"
  pink-dunkel: "#8e0c3d"
  rapport-gelb: "#ffd23f"
  gelb-tief: "#e2ae00"
  gelb-hell: "#fff1bf"
  gelb-hauch: "#fffaeb"
  zartrosa: "#fff2f7"
  rosa-papier: "#ffe4ee"
  rosa-hauch: "#fffafc"
  linie: "#f1dde6"
  linie-kraeftig: "#e6cdd8"
  tinte: "#2a1f2d"
  tinte-weich: "#5b4a5c"
  tinte-hover: "#45334a"
  weiss: "#ffffff"
  faserweiss: "#fcf4ee"
  gold: "#c9a24a"
  gold-tief: "#9c7a2c"
  gold-text: "#7a5d18"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.4rem + 3.2vw, 4.2rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 1.3rem + 3vw, 3.7rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  amount:
    fontFamily: "Bricolage Grotesque, Figtree, system-ui, sans-serif"
    fontSize: "clamp(3.1rem, 2rem + 4vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontFeature: "\"lnum\", \"tnum\""
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(19px, 1.1vw + 13px, 21px)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 750
    lineHeight: 1.3
  small:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  tag-label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  giftcard: "3px"
  paper: "6px"
  field: "12px"
  card: "14px"
  panel: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "22px"
  lg: "48px"
  section: "84px"
  page-edge: "16px"
components:
  button-primary:
    backgroundColor: "{colors.geschenkpapier-pink}"
    textColor: "{colors.weiss}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.pink-tief}"
  button-ink:
    backgroundColor: "{colors.tinte}"
    textColor: "{colors.weiss}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "56px"
  button-ink-hover:
    backgroundColor: "{colors.tinte-hover}"
  button-ghost:
    backgroundColor: "{colors.weiss}"
    textColor: "{colors.pink-tief}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
    height: "56px"
  button-ghost-hover:
    backgroundColor: "{colors.zartrosa}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "48px"
  chip:
    backgroundColor: "{colors.weiss}"
    textColor: "{colors.tinte}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
    height: "52px"
  chip-selected:
    backgroundColor: "{colors.tinte}"
    textColor: "{colors.weiss}"
  input-field:
    backgroundColor: "{colors.weiss}"
    textColor: "{colors.tinte}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
    height: "54px"
  shop-item:
    backgroundColor: "{colors.weiss}"
    rounded: "{rounded.card}"
    padding: "16px 20px 20px"
  paper-sheet:
    backgroundColor: "{colors.weiss}"
    rounded: "{rounded.paper}"
    padding: "clamp(26px, 3.2vw, 46px)"
  hang-tag:
    backgroundColor: "{colors.rapport-gelb}"
    textColor: "{colors.tinte}"
    typography: "{typography.tag-label}"
    width: "128px"
  notice-bar:
    backgroundColor: "{colors.gelb-hell}"
    textColor: "{colors.tinte}"
---

# Design System: Zukunftsgeschenk

## Overview

**Creative North Star: "Das eingepackte Geschenk"**

Der Shop ist ein Geschenk, das sich beim Besuch auspackt. Ganz oben liegt pinkes Geschenkpapier mit gelbem Rapport aus Sternen, Kreisen und Pfeilen, mit Faserstruktur und leichtem Papierglanz, quer darüber ein weißes Satinband mit großer Masche und ein gelber Anhänger mit Lochöse. Darunter liegt der eigentliche Shop: hell, auf Weiß, Zartrosa und Gelbhauch, mit tintenfarbener Schrift. Das Papier ist Verpackung. Die Bedienung findet auf ruhigem weißem Papier statt.

Die Dichte ist großzügig und für Menschen zwischen 50 und 75 gebaut: Grundschrift 19 px, Buttons und Chips mindestens 48 bis 56 px hoch, klare Abschnitte mit viel Luft. Die Materialwelt bleibt greifbar und handwerklich: Faserpapier, weiche Papierschatten, gerissene Zackenkanten, Goldfolie nur für das Goldkuvert. Die Geschenkkarte selbst ist das Produkt und steht als Objekt im Bild, leicht gedreht, mit Schatten wie echtes Papier.

Der Admin-Bereich ist eine eigene, dichte Arbeitsoberfläche. Er übernimmt nur Tinte, Pink als Akzent und Bricolage für Titel, ohne Papier, Band und Risse.

**Key Characteristics:**
- Pinkes Geschenkpapier mit gelbem Rapport als Verpackung, heller Shop darunter.
- Weißes Faserpapier mit weichem, tiefem Schatten als Bedienfläche.
- Pill-Form für alles Anklickbare, Tinte als Auswahlzustand.
- Bricolage Grotesque in 800 für Titel und Beträge, Figtree für Text.
- Gerissene Zackenkanten als seltener Abschnittswechsel.

## Colors

Eine Papierwelt aus kräftigem Geschenkpink und Sonnengelb, getragen von Weiß, Zartrosa und einer warmen, fast schwarzen Tinte.

### Primary
- **Geschenkpapier-Pink** (#d81b6a): Grundton des Geschenkpapiers, Primärbutton, Zählerplakette im Warenkorb, Hervorhebung einzelner Wörter in H1 und H2, Fokusring. Auf Weiß nur als Akzent; als Fläche nur als Papier mit Rapport.
- **Pink tief** (#b3124f): Hover des Primärbuttons, Linkfarbe, Ghost-Button-Text und Rahmen, Icons in Hinweisen. Die textsichere Pinkstufe auf Weiß.
- **Pink dunkel** (#8e0c3d): Fehlertext und Fehlerzustände.

### Secondary
- **Rapport-Gelb** (#ffd23f): Sterne und Kreise im Papier-Rapport, Anhänger, Sonnenscheibe hinter dem Produkt, Schrittnummern, Textauswahl, Schieberegler-Knopf.
- **Gelb hell** (#fff1bf): Pflichthinweis-Leiste, Tabellenkopf, Tab-Schienen.
- **Gelbhauch** (#fffaeb): Abschnittsgrund für Rechner und Zukunftsdepot, Ergebnisflächen, gewählte Zustellart.

### Tertiary
- **Gold** (#c9a24a) und **Gold tief** (#9c7a2c): ausschließlich Goldkuvert und Aktionshinweise dazu. Als Fläche immer als Goldfolien-Verlauf. Text in Gold auf Weiß nutzt **Gold Text** (#7a5d18, Kontrast 6:1).

### Neutral
- **Tinte** (#2a1f2d): gesamte Schrift, gewählte Chips, Tabs und Segmente, Ink-Button, Fußzeilenpapier.
- **Tinte weich** (#5b4a5c): Hinweistext, Metadaten, Achsenbeschriftung.
- **Tinte hover** (#45334a): Hover des Ink-Buttons, Sterne im Nachtpapier.
- **Weiß** (#ffffff): Seitengrund, Papierkarten, Felder, Chips.
- **Zartrosa** (#fff2f7), **Rosa-Papier** (#ffe4ee), **Rosa-Hauch** (#fffafc): ruhige Abschnittsgründe, Hover-Flächen, Vorschaubühne, Hinweisboxen.
- **Linie** (#f1dde6) und **Linie kräftig** (#e6cdd8): Trennlinien, Ränder von Karten, Feldern und Chips.
- **Faserweiß** (#fcf4ee): sichtbarer Papierrand an jeder Risskante.

### Named Rules
**The Papier-ist-Verpackung Rule.** Pink als große Fläche erscheint nur als Geschenkpapier mit Rapport, Faser und Glanz: im Auspack-Hero, in der Weihnachtsaktion unter einer Risskante, als Streifen an Anhänger und Warenkorb. Glattes Vollflächen-Pink als Band oder Hero ist ausgeschlossen. Bedienflächen sind weiß, rosa oder gelb.

**The Tinte-wählt Rule.** Ein gewählter Zustand ist immer Tinte auf Weiß umgekehrt: gewählter Chip, Tab, Segment, Filter, Vorschau-Umschalter. Pink markiert Hover und Fokus, Tinte markiert die Auswahl.

**The Gold-nur-fürs-Kuvert Rule.** Goldfolie gehört dem Goldkuvert und seiner Aktion. Sonst taucht Gold nicht auf.

## Typography

**Display Font:** Bricolage Grotesque (mit Figtree, system-ui)
**Body Font:** Figtree (mit system-ui, -apple-system, Segoe UI)

**Character:** Bricolage in 800 mit enger Laufweite ist laut, freundlich und ein wenig handgemacht, wie ein Aufdruck auf Geschenkpapier. Figtree ist ruhig, rund und auch in 17 bis 21 px sehr gut lesbar.

### Hierarchy
- **Display** (800, clamp 2.6rem bis 4.2rem, Zeilenhöhe 0.96, Laufweite -0.035em): H1 auf Papierkarten. Ein Wort darf in Pink stehen.
- **Headline** (800, clamp 2.2rem bis 3.7rem, 1.04, -0.02em): Abschnittstitel H2.
- **Title** (800, 22 bis 25 px, 1.04): Kartennamen, Schrittitel, FAQ-Fragen (21 bis 25 px, 1.25).
- **Amount** (800, clamp 3.1rem bis 5.4rem, 0.95, -0.04em, Tabellenziffern): Beträge im Rechner, auf Anhängern und Karten.
- **Body** (400, 19 px, 1.6): Fließtext. Leittext 19 bis 21 px mit höchstens 62ch, Antworten höchstens 72ch.
- **Label** (750, 19 px): Feldbeschriftungen, Legenden, Chip-Text, Buttontext.
- **Small** (400, 17 px, 1.5, Tinte weich): nur Hinweise unter Feldern, Metadaten, Fußnoten.
- **Tag Label** (800, 16 px, Versalien, 0.1em): nur der Empfängername auf Anhänger und Geschenkkarte, etwa „Für Lena“. Teil des Objekts, keine Überschrift.

### Named Rules
**The 19-Pixel Rule.** Lesetext beginnt bei 19 px. 17 px ist die Untergrenze und nur für Hinweise und Metadaten erlaubt.

**The Ziffern-stehen Rule.** Beträge, Tabellen und Zähler nutzen Versal- und Tabellenziffern.

## Layout

Ein Container mit 1200 px Maximalbreite, Seitenrand mindestens 16 px inklusive Safe Area. Abschnitte sind vollbreite Bänder mit 76 bis 110 px Innenabstand oben und unten, meist 84 bis 90 px. Abstände im Inneren folgen grob 8, 12, 22 und 48 px.

Der Hero ist zweispaltig (etwa 1.06 zu 0.94, Abstand 56 px): links die weiße Kaufkarte, rechts das Produkt vor einer gelben Sonnenscheibe. Unter 900 px wird alles einspaltig, das Produkt rückt nach oben. Der Kartenshop nutzt ein Sechs-Spalten-Raster mit Kacheln über zwei oder vier Spalten, unter 1000 px zwei Spalten. Konfigurator, Rechner und Infoseiten sind zweispaltig mit einer klebenden Vorschau oder Einleitung (top 110 px) und werden unter 900 bis 960 px einspaltig, Vorschau zuerst.

Die Kopfzeile klebt oben (76 px), die Navigation klappt unter 1220 px in ein Menü. Darüber steht immer die gelbe Pflichthinweis-Leiste.

## Elevation & Depth

Tiefe entsteht durch Papier, das auf Papier liegt. Schatten sind warm getönt (Tinte oder Weinrot, nie Grau) und bestehen aus einer scharfen Kontaktlinie plus einem weichen, tief versetzten Schlagschatten. Flächen im Shop sind sonst flach mit 1 px Rand.

### Shadow Vocabulary
- **Papier** (`box-shadow: 0 2px 3px rgba(42,31,45,.12), 0 26px 50px -24px rgba(42,31,45,.55)`): Kaufkarte, Papierkarten auf Info- und Bedienseiten.
- **Weich** (`box-shadow: 0 1px 2px rgba(42,31,45,.08), 0 16px 34px -20px rgba(42,31,45,.42)`): Rechner, Hover der Shop-Kachel, Bildunterschrift-Pille.
- **Geschenkkarte** (`box-shadow: 0 1px 2px rgba(42,31,45,.22), 0 18px 28px -14px rgba(42,31,45,.55)`): das Produkt als Objekt.
- **Pink-Schein** (`box-shadow: 0 1px 1px rgba(142,12,61,.3), 0 12px 22px -12px rgba(216,27,106,.8)`): nur unter dem Primärbutton.
- **Hängend** (`filter: drop-shadow(0 14px 14px rgba(80,0,32,.3))`): Anhänger, Masche, Band.

### Named Rules
**The Weiche-Papierschatten Rule.** Schatten sind weich und tief versetzt wie bei Papier auf dem Tisch. Ein harter, versetzter Block-Schatten passt nicht in diese Welt.

## Shapes

Zwei Formfamilien. Bedienelemente sind rund: Pill (999 px) für Buttons, Chips, Tabs, Segmente, Filter und Kopfzeilen-Knöpfe, 12 px für Felder und Beispiel-Buttons, 14 px für Kacheln und Hinweisboxen, 18 bis 20 px für große Formular- und Rechnerflächen. Papierobjekte sind fast eckig: Geschenkkarten 3 px, Papierkarten 6 px, Goldkuvert 8 px.

Wiederkehrende Silhouetten: der Anhänger mit abgeschrägten oberen Ecken und ausgestanzter Lochöse samt weißem Ring, die gerissene Zackenkante mit Faserweiß-Rand und das Satinband mit Masche.

**The Sparsamer-Riss Rule.** Höchstens zwei Risskanten pro Seite, mit wechselnder Rissform (a und b), damit sie nicht gleich aussehen.

## Components

### Buttons
Satt, rund und groß genug für jeden Daumen.
- **Shape:** Pill (999 px), Höhe 56 px, klein 48 px.
- **Primary:** Geschenkpapier-Pink, weißer Text in 750, Pink-Schein darunter, Pfeil-Icon rechts.
- **Hover / Focus:** Pink tief, hebt sich 1 px, Pfeil rückt 3 px nach rechts. Fokus als 3 px Pinkring mit 3 px Abstand.
- **Ink:** Tinte mit Tinteschatten, Hover Tinte hover.
- **Ghost:** Weiß mit 2 px Innenrahmen in Pink tief, Hover Zartrosa.
- **Disabled:** Grau-Rosa (#d9d0d6) mit dunkler Schrift, ohne Schatten.
- **Textlink mit Pfeil:** Pink tief, 750, 19 px, Unterstreichung beim Hover.

### Chips
- **Style:** Weiß, 2 px Rand in Linie kräftig, Pill, 52 px hoch, Tabellenziffern.
- **State:** Hover Rand Pink, Text Pink tief. Gewählt Tinte mit weißem Text. Gleiches Muster für Filter, Tabs, Segmente.

### Cards / Containers
- **Corner Style:** Kacheln 14 px, Papierkarten 6 px, große Formflächen 18 px.
- **Background:** Weiß. Papierkarten tragen die Faserstruktur mit 50 % Deckkraft.
- **Shadow Strategy:** Kacheln flach mit Rand, Hover mit weichem Schatten und 2 px Anhebung. Papierkarten immer mit Papierschatten.
- **Border:** 1 px Linie auf Kacheln und Formularflächen.
- **Internal Padding:** Kacheln 16 bis 20 px, Papierkarten clamp 26 bis 46 px.

### Inputs / Fields
- **Style:** Weiß, 2 px Rand Linie kräftig, 12 px Radius, 54 px hoch, 19 px Text, Cursor in Pink.
- **Focus:** Rand Pink plus weicher 4 px Pinkschein.
- **Error / Disabled:** Rand Pink tief, Grund Zartrosa, Fehlertext Pink dunkel in 650.
- **Auswahlkarten (Zustellart):** 14 px Radius, 2 px Rand, gewählt mit Tinterand und Gelbhauch.

### Navigation
- **Style:** Weiße, klebende Kopfzeile mit Linie unten, Wortmarke in Bricolage 800. Links in Figtree 650, 18 px, als Pills.
- **States:** Hover und aktive Seite Zartrosa mit Pink tief. Warenkorb als Pill mit 2 px Tinterand und pinker Zählerplakette.
- **Mobile:** Unter 1220 px Menüknopf, Liste klappt vollbreit auf, Einträge 19 px mit Trennlinien.

### Anhänger (Signature)
Gelbes Faserpapier mit abgeschrägten oberen Ecken, gestanzter Lochöse mit weißem Ring, Faden darüber, unten ein Streifen pinkes Geschenkpapier. Inhalt: Empfängername in Tag Label, Betrag in Amount, Anlass in Bricolage 700. Im Hero hängt er an der Masche und fällt beim Auspacken; auf Bedienseiten hängt er ruhig als Dekoration (leicht gedreht, -7°).

### Geschenkkarte (Signature)
Das Produkt. Formate A6, Postkarte, Quadrat und Anhänger, skaliert über eine Basisbreite. Papier in Pink, Gelb, Rosa, Tinte oder Gold, jeweils mit Rapport und Faser, darauf ein Feld mit Emblem (weiß, Tinte, Pink oder Gelb je Motiv; Embleme in src/components/emblems.tsx), Name, Betrag, Anlass und Absender in Kursiv. Steht leicht gedreht (-3°), optional mit Kuvert dahinter.

### Auspacken (Signature)
Nur mit JavaScript und ohne reduzierte Bewegung: Papier bedeckt den ersten Bildschirm vollflächig, beim Scrollen gleitet das Band auseinander, die Masche löst sich, das Papier reißt an der Zackenkante auf. Ohne Bewegung bleibt ein Papierstreifen mit Band oben stehen.

## Do's and Don'ts

### Do:
- **Do** Pink als Fläche nur als Geschenkpapier mit gelbem Rapport, Faser und Glanz zeigen.
- **Do** jede Bedienung auf Weiß, Zartrosa oder Gelbhauch legen.
- **Do** gewählte Zustände in Tinte (#2a1f2d) und Hover in Pink zeigen.
- **Do** Lesetext ab 19 px und Klickflächen ab 48 px halten.
- **Do** Papierobjekte mit warmem, weichem Papierschatten und fast eckigen Ecken (3 bis 6 px) bauen.
- **Do** Strich-Icons im 24er-Raster mit 2 px Strich und runden Enden verwenden.
- **Do** Bewegung mit `cubic-bezier(.16,1,.3,1)` führen und bei reduzierter Bewegung abschalten.

### Don't:
- **Don't** ein glattes Magenta-Band als Navigation oder einen glatten Magenta-Hero bauen.
- **Don't** mehr als zwei Risskanten auf einer Seite setzen.
- **Don't** Goldfolie außerhalb des Goldkuverts oder auf Text einsetzen.
- **Don't** graue oder harte, versetzte Schatten verwenden.
- **Don't** Versal-Etiketten über Überschriften setzen. Versalien gibt es nur für den Empfängernamen auf Anhänger und Karte.
- **Don't** Pink (#d81b6a) für Fließtext auf Weiß nutzen. Für Text gilt Pink tief (#b3124f).
