# Projektregeln Zukunftsgeschenk

## Sprache und Texte (globale Kundenregel)
- Keine Gedankenstriche (– oder —) in sichtbaren Texten, E-Mails, PDFs, Metadaten, Rechtstexten, Commit-Nachrichten oder Antworten an den Kunden. Stattdessen Punkt, Komma, Doppelpunkt oder ein neuer Satz. Bereiche mit „bis“ schreiben („1 bis 5“).
- Keine typischen KI-Textmuster: keine „nicht X, sondern Y“-Floskeln, keine Doppelpunkt-Enthüllungen, keine Anführungszeichen um erfundene Begriffe, keine Floskeln („ganz einfach“, „nahtlos“, „im Handumdrehen“), keine Emojis, keine Dreierlisten aus Prinzip.
- Kurze, klare Sätze in österreichischem Deutsch (Jänner, Kuvert, Christbaum). Beträge als „100 €“.
- Vor jedem Commit: `LC_ALL=C.UTF-8 grep -rn "[–—]" src` muss für sichtbaren Text leer sein.
