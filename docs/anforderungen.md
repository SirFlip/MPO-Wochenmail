# Anforderungen: Wochenmail im MPO

- **Gegenstand:** Funktion „Wochenmail“ im MPO (`https://portal.wrk.at/mpo`)
- **Bereiche:** KTW & N-KTW, Notfallrettung (NFR), Ambulanzen (AMB)
- **Zielgruppe:** Entwicklung des MPO, Product Owner, Fachabteilungen (Freigabe)
- **Referenz:** Funktionierende Umsetzung als Userscript: `wochenmail.user.js` (Version 1.3.0)

## Inhalt

1. [Einleitung](#1-einleitung)
2. [Allgemein (alle Bereiche)](#2-allgemein-alle-bereiche)
3. [Gemeinsam für KTW und NFR](#3-gemeinsam-für-ktw-und-nfr)
4. [KTW & N-KTW](#4-ktw--n-ktw)
5. [Notfallrettung (NFR)](#5-notfallrettung-nfr)
6. [Ambulanzen (AMB)](#6-ambulanzen-amb)
7. [Nicht im Umfang](#7-nicht-im-umfang)
8. [Offene Punkte](#8-offene-punkte)
9. [Anhang A: Datenquellen im Portal](#anhang-a-datenquellen-im-portal)
10. [Anhang B: Kontaktdaten und feste Texte](#anhang-b-kontaktdaten-und-feste-texte)

---

## 1. Einleitung

### 1.1 Ziel

Die Dienstführungen von KTW, NFR und Ambulanzdienst informieren die Mitarbeiter*innen regelmäßig per Mail über offene Positionen in den kommenden Tagen („Wochenmail“). Die Mail wird heute von Hand bzw. über ein Userscript aus den Daten des MPO zusammengestellt.

Das MPO soll diese Mail selbst erzeugen: Bereich und Zeitraum wählen, Vorschau prüfen und bei Bedarf kürzen, dann formatiert in Outlook übernehmen.

### 1.2 Aufbau dieses Dokuments

- **Abschnitt 2** gilt für alle drei Bereiche: Aufruf, Bedienung, Mail-Rahmen und gemeinsame Regeln.
- **Abschnitt 3** gilt für KTW und NFR gemeinsam: Auswahl der Dienste und die Unterschrift über den Support-Dienstplan.
- **Abschnitte 4 bis 6** beschreiben je Bereich, welche Positionen in der Mail stehen und wie sie dargestellt werden.

Anforderungen sind als User Stories (`US-…`) mit Akzeptanzkriterien (`AK…`) formuliert. Fachregeln, die mehrere Stories betreffen, sind als Regeln (`R-…`) beschrieben und werden in den Akzeptanzkriterien referenziert. Die IDs sind für die Übernahme ins Ticketsystem gedacht.

### 1.3 Rollen

| Rolle | Beschreibung |
|---|---|
| **Dienstführung** | Erstellt die Wochenmail für ihren Bereich (KTW-Support, NFR-Support, Ambulanzdienstführung). |
| **Empfänger*in** | Mitarbeiter*in, die die Mail bekommt und sich auf offene Positionen meldet. |

### 1.4 Begriffe

| Begriff | Bedeutung |
|---|---|
| **Event** | Dienstplan-Eintrag im MPO, z. B. ein Rettungsdienst-Dienstplan oder eine Ambulanz. Hat eine Dienstplanklasse (Division), einen Event-Status und einen oder mehrere Event-Tage. |
| **Event-Tag** | Ein Tag (bzw. Unterabschnitt) eines Events mit Beginn, Ende und MPO-Status. |
| **Fahrzeug** | Normeinheit der obersten Ebene eines Event-Tags (z. B. KTW, RTW, NAW). |
| **Position** | Normeinheit unterhalb eines Fahrzeugs bzw. eines Ambulanz-Tags, die mit einer Person besetzt wird (z. B. Lenker*in, SAN1). |
| **Zuteilung** | Eine Person ist der Position fix zugeteilt. |
| **Dienstwunsch** | Eine Person hat sich für die Position eingetragen. |
| **Optional / Pflicht** | Kennzeichen eines Fahrzeugs bzw. einer Position, ob es zusätzlich (optional) oder fix (Pflicht) besetzt werden soll. |
| **RKK-Fahrzeug** | KTW, dessen Name „RKK“ enthält. |
| **Support-Event** | Dienstplan der Dienstführung eines Bereichs (Dienstplanklasse `RD-KTW-SUPPORT` bzw. `RD-NFR-SUPPORT`). |
| **Von / Bis** | Gewählter Zeitraum der Mail. Von ist der erste Tag, Bis der erste Tag, der **nicht** mehr dazugehört. |

---

## 2. Allgemein (alle Bereiche)

### US-A1: Wochenmail aufrufen

> Als **Dienstführung** möchte ich die Wochenmail direkt im MPO-Menü öffnen können, damit ich kein zusätzliches Werkzeug brauche.

**Akzeptanzkriterien**

- **AK1:** Im Menü „Dienste“ gibt es den Eintrag **„Wochenmail“** (Symbol: Briefumschlag), direkt nach „Kalenderabo“.
- **AK2:** Ein Klick öffnet die Wochenmail-Ansicht (Dialog oder eigene Seite) innerhalb des MPO, ohne erneute Anmeldung.
- **AK3:** Die Ansicht kann über „Schließen“, die Taste `Esc` oder einen Klick außerhalb geschlossen werden.
- **AK4:** Wird die Ansicht in derselben Sitzung erneut geöffnet, bleiben Auswahl und zuletzt erstellte Vorschau erhalten.

### US-A2: Bereich und Zeitraum wählen

> Als **Dienstführung** möchte ich Bereich und Zeitraum mit sinnvollen Vorgaben wählen, damit ich für die übliche Wochenmail nichts einstellen muss.

**Akzeptanzkriterien**

- **AK1:** Auswahl **Bereich** mit den Werten „KTW & N-KTW“, „Notfallrettung“, „Ambulanzen“. Vorgabe: „KTW & N-KTW“.
- **AK2:** Datumsfeld **Von**. Vorgabe: morgen (Wiener Datum, R-A1).
- **AK3:** Datumsfeld **Bis** (exklusiv). Vorgabe: Von + 8 Tage.
- **AK4:** Wird Von geändert, verschiebt sich Bis so, dass der Abstand zwischen Von und Bis gleich bleibt. Ändert die Dienstführung Bis selbst, gilt ab dann dieser neue Abstand.
- **AK5:** Liegt Bis nicht nach Von (oder fehlt ein Datum), wird nichts erstellt und die Meldung „„Bis“ muss nach „Von“ liegen.“ angezeigt.

### US-A3: Wochenmail erstellen

> Als **Dienstführung** möchte ich mit einem Klick die fertige Mail für Bereich und Zeitraum erzeugen, damit ich die offenen Positionen nicht von Hand zusammensuchen muss.

**Akzeptanzkriterien**

- **AK1:** Button **„Erstellen“** lädt die Daten für Bereich und Zeitraum und zeigt die fertige Mail als Vorschau (Inhalt je Bereich: Abschnitte 4 bis 6, Rahmen: US-A6).
- **AK2:** Während des Ladens ist „Erstellen“ gesperrt und ein Fortschritt sichtbar (z. B. „Lade Dienste … 12/40“).
- **AK3:** Wird ein neuer Lauf gestartet, solange noch ein alter läuft, zählt nur das Ergebnis des neuesten Laufs.
- **AK4:** Ausgewertet werden nur Daten, die die angemeldete Person im MPO sehen darf.
- **AK5:** Enthält das Ergebnis keine einzige offene Position, erscheint „Fertig. Keine offenen Positionen im Zeitraum gefunden.“ und Kopieren (US-A5) bleibt gesperrt.
- **AK6:** Konnte keine Unterschrift ermittelt werden (R-K3 bzw. US-AMB4), wird die Mail trotzdem erstellt, mit Platzhalter in der Unterschrift und dem Hinweis „Keine Dienstführung gefunden, bitte Unterschrift prüfen.“ (KTW/NFR) bzw. „Kein Name gefunden, bitte Unterschrift prüfen.“ (AMB).
- **AK7:** Können die Dienstwünsche nicht geladen werden, bricht die Erstellung mit Fehlermeldung ab. Begründung: Ohne Wünsche würden bereits gewünschte Positionen fälschlich als offen erscheinen (R-A5).
- **AK8:** Ist die Sitzung abgelaufen, erscheint „Die Portal-Sitzung ist abgelaufen. Bitte die Seite neu laden und anmelden.“ statt einer unvollständigen Mail.
- **AK9:** Andere Fehler werden als Meldung angezeigt; „Erstellen“ ist danach wieder verfügbar.

### US-A4: Vorschau kürzen

> Als **Dienstführung** möchte ich einzelne Zeilen aus der Vorschau entfernen, damit ich Positionen weglassen kann, die z. B. schon telefonisch vergeben sind.

**Akzeptanzkriterien**

- **AK1:** Doppelklick auf die Datumszelle einer Zeile entfernt diese Zeile aus der Mail. Ein Hinweis in der Ansicht erklärt das („Doppelklick aufs Datum entfernt eine Zeile.“).
- **AK2:** Die Zebrastreifen der Tabelle werden nach dem Entfernen neu berechnet (jede zweite Zeile grau `#eeeeee`).
- **AK3:** AMB: Hat eine Ambulanz danach keine Zeile mehr, fällt der ganze Ambulanz-Block weg.
- **AK4:** Die Änderung betrifft nur die Vorschau bzw. die kopierte Mail, nicht die Daten im MPO.

### US-A5: Mail in Outlook übernehmen

> Als **Dienstführung** möchte ich die Mail mit einem Klick kopieren und formatiert in Outlook einfügen, damit Tabellen, Farben und Links erhalten bleiben.

**Akzeptanzkriterien**

- **AK1:** Button **„In Zwischenablage kopieren“** kopiert die Mail in der aktuellen Form (inkl. Änderungen aus US-A4) als formatiertes HTML und zusätzlich als reinen Text.
- **AK2:** Nach dem Einfügen in eine neue Outlook-Mail sehen Tabellen, Farben, Schrift und Links so aus wie in der Vorschau.
- **AK3:** Alle Formatierungen der Mail sind inline am jeweiligen Element angegeben. Begründung: Outlook verwirft `<style>`-Blöcke.
- **AK4:** Nach dem Kopieren erscheint „Kopiert. Jetzt in Outlook einfügen.“
- **AK5:** Der Button ist gesperrt, bis eine Mail mit mindestens einer offenen Position erstellt wurde.
- **AK6:** Die Mail wird **nicht** automatisch verschickt (siehe Abschnitt 7).

### US-A6: Einheitlicher Mail-Rahmen

> Als **Empfänger*in** möchte ich, dass alle Wochenmails gleich aufgebaut sind und im Rotkreuz-Design erscheinen, damit ich mich schnell zurechtfinde.

**Akzeptanzkriterien**

- **AK1:** Die Mail besteht von oben nach unten aus:
  1. Titel, zentriert, 26 px: „Offene Positionen am **KTW & N-KTW**“ / „Offene Positionen in der **Notfallrettung**“ / „Offene Positionen auf **Ambulanzen**“ (hervorgehobener Teil in Rot `#B70E0C`)
  2. Anrede „Liebe Kolleg*innen,“
  3. Einleitungstext des Bereichs (Anhang B)
  4. Inhalt des Bereichs (Abschnitte 4 bis 6)
  5. Kontakttext mit Mail-Adresse und Telefonnummer des Bereichs als klickbare Links (`mailto:` bzw. `tel:`), danach „Wir wünschen eine schöne Woche!“ (Anhang B)
  6. „Liebe Grüße,“ und die Unterschrift
  7. Fußzeile in Hellgrau, 12 px, mit Hinweis auf Status und Berechtigung des Verteilers (Anhang B)
- **AK2:** Gestaltung: Schrift Dunant (Ersatz Arial, serifenlos), Fließtext Grau `#737373` in 14 px, Akzentfarbe Rot `#B70E0C`, weißer Hintergrund.
- **AK3:** Feste Breite der Mail: KTW 700 px, NFR 900 px, AMB 760 px, zentriert.
- **AK4:** Tabellen: Kopfzeile grau hinterlegt, fett, 16 px; erste Spalte (Datum) fett und linksbündig, übrige Spalten zentriert; Zeilen abwechselnd weiß und grau (`#eeeeee`).
- **AK5:** Offene Positionen sind in Rot `#bb0000` hervorgehoben.
- **AK6:** Jeder **MPO-Link** führt direkt auf den betreffenden Event-Tag und die Position im MPO (`/mpo/rpt/mpoevent/{Event}?day={Event-Tag}&shiftlink={Position}&row={Position}`) und öffnet in einem neuen Fenster.

### Gemeinsame Regeln

#### R-A1: Zeitzone

Alle Uhrzeiten, Datumsgrenzen, Wochentage und Vorgaben (z. B. „morgen“) werden in **Europe/Vienna** gerechnet, unabhängig von der Zeitzone des Browsers oder Servers. Der Zeitraum umfasst alle Zeitpunkte ab Von 00:00 bis vor Bis 00:00 (Wiener Zeit).

#### R-A2: Tagdienst und Nachtdienst

Ein Dienst ist ein **Tagdienst**, wenn er zwischen 05:00 und 16:59 (Wiener Zeit) beginnt, sonst ein **Nachtdienst**. Maßgeblich ist der Dienstbeginn des Fahrzeugs.

#### R-A3: Wiener Feiertage

Feiertage sind:

- fest: 1.1., 6.1., 1.5., 15.8., 26.10., 1.11., 15.11. (Leopolditag), 8.12., 25.12., 26.12.
- beweglich: Ostersonntag, Ostermontag, Christi Himmelfahrt (Ostern + 39), Pfingstsonntag (+ 49), Pfingstmontag (+ 50), Fronleichnam (+ 60)

#### R-A4: Wiener Sommerferien

Die Sommerferien beginnen am Samstag zwischen 28. Juni und 4. Juli und dauern bis zum Schulbeginn am ersten Montag im September (dieser Montag gehört nicht mehr dazu).

#### R-A5: Wann eine Position als besetzt gilt

Eine Position gilt als **besetzt**, wenn mindestens eines zutrifft:

- Sie hat eine Zuteilung.
- Für sie liegt ein Dienstwunsch mit Status 0, 1 oder 2 vor.
- (nur AMB) Sie ist an einen Subunternehmer vergeben.

Sonst gilt sie als **offen**. Ein Dienstwunsch wird in der Mail wie eine Zuteilung behandelt (z. B. mit Namen angezeigt).

---

## 3. Gemeinsam für KTW und NFR

### US-K1: Relevante Dienste auswählen

> Als **Dienstführung** möchte ich, dass nur echte Rettungsdienst-Dienste berücksichtigt werden, damit Spezial-, Bereitschafts- und Koordinationsdienste nicht in der Mail landen.

**Akzeptanzkriterien**

- **AK1:** Berücksichtigt werden Events im Zeitraum, für die alles gilt:
  - Dienstplanklasse `RD`
  - der Name enthält weder „Spezialdienste“ noch „Bereitschaft“ noch „Stationskoordination“
  - Event-Status 0 bis 4
  - mindestens ein Event-Tag hat den MPO-Status 0 bis 3
- **AK2:** Berücksichtigt werden nur Fahrzeuge des Bereichs: KTW-Mail die Fahrzeugtypen `KTW` und `NKTW`, NFR-Mail die Fahrzeugtypen `RTW` und `NAW`.
- **AK3:** Normeinheiten mit folgenden Namen werden auf Fahrzeugebene ignoriert, weil es sich um falsch eingehängte Positionen handelt: `RTW KFZ`, `RTW-NAW F`, `NFR 1`, `SAN 1`, `N-KTW KFZ`, `KTW KFZ`, `KTW F`, `SAN 2`, `FSD SR FahrerIn`, `PKW KFZ`, `PKW F`.
- **AK4:** Jeder Dienst wird dem Wiener Kalendertag seines Dienstbeginns zugeordnet. Die Mail ist chronologisch nach Tagen sortiert.
- **AK5:** Die Notärzt*innen-Position `NA` am NAW gilt nie als offen. Begründung: Sie wird nicht über die Wochenmail besetzt.

### R-K1: Tagdienste an Werktagen entfallen

Tagdienste (R-A2) von Montag bis Freitag werden **nicht** in die Mail aufgenommen. Ausnahmen, in denen sie doch aufgenommen werden:

- an Wiener Feiertagen (R-A3),
- in den Wiener Sommerferien (R-A4),
- nur KTW: bei RKK-Fahrzeugen.

Begründung: Werktags tagsüber ist der Dienst hauptberuflich abgedeckt. An Feiertagen und in den Sommerferien wird zusätzlich Personal gebraucht.

### US-K2: Unterschrift durch die diensthabende Dienstführung

> Als **Dienstführung** möchte ich, dass die Mail automatisch mit den Namen der Dienstführenden unterschrieben wird, die zum Versand im Dienst sind, damit Rückfragen an die richtigen Personen gehen.

**Akzeptanzkriterien**

- **AK1:** Bezugszeitpunkt ist **Von um 18:00** (Wiener Zeit).
- **AK2:** Das Support-Event wird über seine Dienstplanklasse gefunden: `RD-KTW-SUPPORT` für KTW, `RD-NFR-SUPPORT` für NFR. Gesucht wird unter den im MPO sichtbaren Events dasjenige, das den Bezugszeitpunkt abdeckt. Die Suche darf nicht von den RPT-Rechten der angemeldeten Person abhängen.
- **AK3:** Verwendet wird der Event-Tag des Support-Events, der den Bezugszeitpunkt abdeckt (Beginn ≤ Bezug < Ende).
- **AK4:** Die Dienstführenden werden nach R-K2 ermittelt.
- **AK5:** Unterschrift sind die ersten beiden ermittelten Personen als „Vorname Nachname & Vorname Nachname“.
- **AK6:** Gibt es kein Support-Event, keinen passenden Event-Tag oder niemanden, steht in der Unterschrift der Platzhalter „Dienstführende*r 1 & Dienstführende*r 2“ und es erscheint der Hinweis aus US-A3 AK6.
- **AK7:** Ein Fehler beim Ermitteln der Unterschrift verhindert die Mail nicht (außer bei abgelaufener Sitzung).

### R-K2: Auswahl der Dienstführenden

1. Kandidat*innen sind alle Personen-Positionen des Support-Tags mit Zuteilung. Als Dienstzeit gilt die eigene Schichtzeit der Zuteilung, sonst die Zeit der Position.
2. Die Rollen (Namen der Positionen) werden in dieser Reihenfolge abgearbeitet: **Hauptdienst**, **Beidienst**, danach alle weiteren in der Reihenfolge ihres Auftretens.
3. Je Rolle wird eine Person gewählt:
   - Unter denen, deren Dienstzeit den Bezugszeitpunkt abdeckt, gewinnt die **kürzeste** Schicht.
   - Deckt niemand den Bezugszeitpunkt ab, gewinnt die Schicht, die als **nächste beginnt**.
4. Niemand wird doppelt aufgenommen.

Begründung: Der KTW-Support plant ganze Wochen (Mittwoch 18:00 bis Mittwoch 18:00) und teilt diese in Teilschichten. Die kürzeste abdeckende Schicht ist die tatsächlich diensthabende Person.

---

## 4. KTW & N-KTW

### US-KTW1: Offene KTW-Dienste auflisten

> Als **KTW-Support** möchte ich alle optionalen KTW- und N-KTW-Dienste sehen, auf denen noch ein oder zwei Plätze frei sind, damit Mitarbeiter*innen gezielt ein bestehendes Team ergänzen können.

**Akzeptanzkriterien**

- **AK1:** Grundlage sind die Dienste nach US-K1 und R-K1.
- **AK2:** Aufgenommen werden nur **optionale** Fahrzeuge. Das gilt auch für RKK-Fahrzeuge.
- **AK3:** Fahrzeuge **ohne** RKK mit Dienstbeginn von 05:00 bis einschließlich 12:00 entfallen, auch am Wochenende und an Feiertagen.
- **AK4:** Ein Fahrzeug wird nur aufgenommen, wenn **1 oder 2** Positionen offen sind (R-A5). Fahrzeuge ohne offene Position oder mit 3 und mehr offenen Positionen entfallen.
- **AK5:** Eine Zeile je Fahrzeug, sortiert nach Tag; innerhalb eines Tages in der Reihenfolge des Dienstplans.

### US-KTW2: Darstellung der KTW-Tabelle

> Als **Empfänger*in** möchte ich auf einen Blick sehen, wann, wo und mit wem ein Platz frei ist, damit ich entscheiden kann, ob ich mich melde.

**Akzeptanzkriterien**

- **AK1:** Eine Tabelle mit den Spalten:

  | Spalte | Inhalt |
  |---|---|
  | Datum | Wochentag kurz und Datum, z. B. „Mo. 03.11“ |
  | Dienstzeit | Beginn – Ende, z. B. „19:00 - 07:00“ |
  | Fahrzeug | Bei RKK-Fahrzeugen der Fahrzeugname, sonst „KTW“ |
  | Bezirksstelle | Startort des Fahrzeugs |
  | Lenker*in | Besetzung der ersten Position (Lenker*in) |
  | SAN1 | Besetzung der zweiten Position |
  | SAN2 | Besetzung der dritten Position |
  | Anmerkung | Beschreibung, die an einer Personen-Position des Fahrzeugs hinterlegt ist (leer, wenn keine) |
  | MPO Link | Link „MPO Link“ auf das Fahrzeug (US-A6 AK6) |

- **AK2:** Besetzte Positionen zeigen „Vorname Nachname (Dienstnummer)“, offene Positionen ein rotes „Offen“.
- **AK3:** Einleitung, Kontakt und Unterschrift nach Anhang B bzw. US-K2. Fußzeile mit Berechtigung **SAN2**.

---

## 5. Notfallrettung (NFR)

### US-NFR1: Wochenübersicht der Notfallrettung

> Als **NFR-Support** möchte ich eine Übersicht je Tag und Tag-/Nachtdienst über alle Rettungsmittel, damit Empfänger*innen sofort sehen, wo ein Platz oder ein ganzes Team fehlt.

**Akzeptanzkriterien**

- **AK1:** Grundlage sind die Dienste nach US-K1 und R-K1.
- **AK2:** Eine Tabelle mit der Spalte **Datum** und je einer Spalte für die Rettungsmittel **RKL-1, RKL-2, RKL-3, RKS-1, RKS-2, RKP-1, RKF-1, RKI-1** (in dieser Reihenfolge).
- **AK3:** Je Tag gibt es höchstens zwei Zeilen: **Tag** und **Nacht** (R-A2). Eine Zeile erscheint nur, wenn für diesen Tag und diese Hälfte mindestens ein Dienst eines dieser Rettungsmittel vorhanden ist.
- **AK4:** Die Datumszelle zeigt Wochentag und Datum ohne führende Null und darunter die Hälfte, z. B. „Montag, 3.11“ / „Nacht“.
- **AK5:** Das Rettungsmittel wird aus dem Fahrzeugnamen ermittelt (Teil nach „ - “). Schreibweisen mit Suffix für Tag/Nacht werden vereinheitlicht: `RKL1-N`, `RKL1-T`, `RKL-1N`, `RKL-1T` → `RKL1` (für alle acht Rettungsmittel gleich). Fahrzeuge, die keinem der acht Rettungsmittel entsprechen, entfallen.
- **AK6:** Die Einleitung nennt die ISO-Kalenderwoche von Von („… in der KW 47 …“, Anhang B).
- **AK7:** Kontakt und Unterschrift nach Anhang B bzw. US-K2. Fußzeile mit Berechtigung **SAN1**.

### US-NFR2: Inhalt einer NFR-Zelle

> Als **Empfänger*in** möchte ich in jeder Zelle erkennen, ob der Dienst besetzt ist, welche Funktion fehlt und mit wem ich fahren würde.

**Akzeptanzkriterien**

Für jede Zelle (Tag/Nacht × Rettungsmittel) gilt die erste zutreffende Zeile:

| Fall | Anzeige |
|---|---|
| Kein Dienst vorhanden, Zeile **Tag** | ✔️ (hauptberuflich abgedeckt) |
| Kein Dienst vorhanden, Zeile **Nacht** | „Ganzes Team“ mit kleinem Zusatz „(auf Anfrage)“, ohne Link |
| Alle 3 Positionen offen | Link „Ganzes Team“ |
| Keine Position offen | ✔️ |
| 1–2 Positionen offen | Die offenen Funktionen rot und verlinkt, bei zwei mit „&“ verbunden; darunter klein „mit …“ und die Namen der bereits eingeteilten Personen |

- **AK1:** Anzeigenamen der Funktionen: `RTW-NAW F` → „Lenker“, `NFR 1` → „NFR1“, `SAN 1` → „NFR2 / SAN1“; andere Funktionen mit ihrem Namen.
- **AK2:** **RKL1** gilt am **Samstag im Tagdienst** immer als besetzt (✔️). Begründung: Dieser Dienst wird hauptberuflich besetzt.
- **AK3:** `NA` zählt nie als offen (US-K1 AK5).
- **AK4:** Werktags-Tagdienste ohne Feiertag/Sommerferien erscheinen als ✔️ (sie werden nach R-K1 ohnehin nicht ausgewertet).

---

## 6. Ambulanzen (AMB)

### US-AMB1: Ambulanzen mit offenen Positionen auswählen

> Als **Ambulanzdienstführung** möchte ich alle Ambulanzen im Zeitraum sehen, auf denen noch Positionen offen sind, damit ich gezielt Personal dafür suche.

**Akzeptanzkriterien**

- **AK1:** Berücksichtigt werden Events, für die alles gilt:
  - Dienstplanklasse `AMB`
  - der Name enthält nicht „Spezialdienste“
  - das Event ist im MPO sichtbar (nicht ausdrücklich ausgeblendet)
  - Event-Status 0 bis 4
- **AK2:** Berücksichtigt werden nur Event-Tage, die **im Zeitraum beginnen** (Von ≤ Beginn < Bis) und den MPO-Status 0 bis 3 haben.
- **AK3:** Offen ist jede Personen-Position eines solchen Tags, die nach R-A5 nicht besetzt ist (ohne Zuteilung, ohne Subunternehmer, ohne Dienstwunsch mit Status 0–2).
- **AK4:** Die Regeln für KTW/NFR (US-K1, R-K1, Fahrzeuge) gelten für Ambulanzen **nicht**: Auch Tagdienste an Werktagen werden aufgenommen.
- **AK5:** Eine Ambulanz erscheint nur, wenn sie mindestens eine offene Position hat.

### US-AMB2: Ambulanz-Block

> Als **Empfänger*in** möchte ich zu jeder Ambulanz sehen, worum es geht, damit ich entscheiden kann, ob sie mich interessiert.

**Akzeptanzkriterien**

- **AK1:** Je Ambulanz ein eigener Block (Tabelle mit grauem Rahmen, Abstand zum nächsten Block).
- **AK2:** Kopfzeile in Rot `#B70E0C` mit weißer, fetter Schrift: links der Name der Ambulanz, rechts die Ambulanznummer.
- **AK3:** Darunter die Beschreibung des Events, gekürzt auf **500 Zeichen** (bei Kürzung mit „...“), Zeilenumbrüche bleiben erhalten.
- **AK4:** Hat das Event ein Bild, steht es rechts neben der Beschreibung in 150 px Breite. Das Bild ist in die Mail eingebettet, damit es ohne Zugriff aufs MPO angezeigt wird. Kann es nicht geladen werden, entfällt es ohne Fehlermeldung.
- **AK5:** Die Blöcke sind nach der frühesten offenen Position der Ambulanz sortiert.

### US-AMB3: Offene Positionen einer Ambulanz

> Als **Empfänger*in** möchte ich alle offenen Positionen einer Ambulanz mit Zeit, Funktion und Ort sehen und direkt im MPO öffnen können.

**Akzeptanzkriterien**

- **AK1:** Unter Beschreibung und Bild eine Tabelle mit einer Zeile je offener Position und den Spalten:

  | Spalte | Inhalt |
  |---|---|
  | Datum | Wochentag kurz und Datum, z. B. „Sa. 08.11“ |
  | Dienstzeit | Beginn – Ende der Position (falls nicht hinterlegt: des Event-Tags) |
  | Unterabschnitt | Name des Event-Tags, „-“ wenn leer. **Nur**, wenn mindestens eine Position dieser Ambulanz einen Unterabschnitt hat. |
  | Funktion | Name der Position |
  | Startort | Startort der Position |
  | P / O | „Pflicht“ oder „Optional“ |
  | MPO Link | Link „MPO Link“ auf die Position (US-A6 AK6) |

- **AK2:** Sortierung: nach Tag, innerhalb eines Tages **Pflicht vor Optional**, dann nach Beginn.

### US-AMB4: Einleitung und Unterschrift Ambulanzen

> Als **Ambulanzdienstführung** möchte ich, dass die Mail mit meinem Namen im Namen der Ambulanzdienstführung unterschrieben wird.

**Akzeptanzkriterien**

- **AK1:** Unterschrift: Name der angemeldeten Person („Vorname Nachname“), darunter „im Namen der Ambulanzdienstführung“. Ein Support-Event wird nicht verwendet.
- **AK2:** Ist kein Name verfügbar, steht „Vorname Nachname“ als Platzhalter und es erscheint der Hinweis aus US-A3 AK6.
- **AK3:** Einleitung: fester AMB-Text **ohne** Einladungssatz (Anhang B).
- **AK4:** Kontakt nach Anhang B. Fußzeile mit Berechtigung **SAN2**.

---

## 7. Nicht im Umfang

- **Automatischer Versand:** Die Mail wird nicht aus dem MPO verschickt. Sie wird von der Dienstführung in Outlook eingefügt und von dort an den Verteiler gesendet.
- **Empfängerverwaltung:** Der Verteiler (Status AKTIV/ZBV mit Berechtigung SAN1 bzw. SAN2 oder höher) wird außerhalb des MPO gepflegt.
- **Bearbeiten von Texten in der Vorschau:** Außer dem Entfernen von Zeilen (US-A4) wird in Outlook nachbearbeitet.

---

## 8. Offene Punkte

Für die Umsetzung im MPO zu klären:

1. **Berechtigung:** Wer darf die Wochenmail erstellen? Heute kann es jede Person, die das MPO nutzt; sie sieht nur Daten nach ihren eigenen Rechten. Vorschlag: eigenes Recht je Bereich (KTW-Support, NFR-Support, Ambulanzdienstführung).
2. **Statuswerte:** Die Bedeutung der verwendeten IDs (Event-Status 0–4, MPO-Status 0–3, Wunsch-Status 0–2) ist in diesem Dokument nur als Zahl angegeben. Die Entwicklung sollte die Klartext-Bezeichnungen ergänzen.
3. **Event-Tage KTW/NFR:** Die Referenzumsetzung prüft den MPO-Status 0–3 und den Zeitraum nur auf Event-Ebene (mindestens ein Tag), nicht für jeden einzelnen Event-Tag. Bei Ambulanzen wird jeder Tag einzeln geprüft (US-AMB1 AK2). Festlegen, ob KTW/NFR ebenfalls je Tag filtern sollen.
4. **Feiertage und Sommerferien:** Heute fest berechnet (R-A3, R-A4). Falls das MPO einen Feiertagskalender führt, diesen verwenden.
5. **Feste Texte und Kontaktdaten:** Heute fest hinterlegt (Anhang B). Klären, ob sie im MPO pflegbar sein sollen.
6. **Bilder in Outlook:** Eingebettete Bilder (US-AMB2 AK4) werden von Outlook beim Einfügen nicht immer übernommen. Bei einer Umsetzung im MPO prüfen, ob ein anderer Weg (z. B. Download als `.eml`/`.oft`) zuverlässiger ist.

---

## Anhang A: Datenquellen im Portal

Die Referenzumsetzung verwendet diese Schnittstellen des Portals. Sie zeigen, wo die Daten herkommen. Wie das MPO sie intern bezieht, bleibt der Entwicklung überlassen.

| Zweck | Schnittstelle | Hinweise |
|---|---|---|
| Events im Zeitraum (KTW, NFR, AMB) | `GET /rpt/api/event/mpo/assigned?validFrom=…&validTo=…` | Zeitraum als ISO-Zeitpunkte (UTC) von Von 00:00 bis Bis 00:00 Wiener Zeit. Felder: `division.name`, `name`, `eventState.id`, `visibleInMpo`, `days[].stateInMpo.id`, `days[].startTime/endTime/name`, `ambulanceNumber`, `description`, `pictureAvailable`. |
| Fahrzeuge und Positionen je Event-Tag | `GET /rpt/api/normunitofevent/day/{dayId}` | Fahrzeug: `parentId == null`, `baseNormUnit.type == 'c'`, Typ in `baseNormUnit.name`. Position: `parentId` = Fahrzeug, `baseNormUnit.type == 'p'` (Person); Normeinheiten vom Typ `m` zählen nicht als Position. Weitere Felder: `optional`, `shiftAssignment` (Zuteilung inkl. `employment.employee` und `employmentNumber`), `subcontractor`, `description`, `startLocation.name`, `startTime/endTime`. KTW-Spalten Lenker*in/SAN1/SAN2 = Positionen 1/2/3 des Fahrzeugs. |
| Dienstwünsche je Event-Tag | `POST /rpt/api/preferredassignment/ed/ids`, Body `[dayId]` | Zuordnung über `normUnitOfEventId`; Status in `preferredAssignmentState.id` (0–2 zählen). |
| Support-Event suchen | `GET /rpt/api/event?visibleInMpo=true&personnelCapacityOnly=true&validFrom=…&validTo=…` | MPO-Eventliste („Dienste → Events“). Ohne `visibleInMpo=true` filtert das Portal nach RPT-Rechten und das NFR-Support-Event fehlt. Jedes Event enthält hier nur einen Unter-Tag, daher anschließend das ganze Event laden. |
| Support-Event mit allen Tagen | `GET /rpt/api/event/{id}` | Für den Event-Tag, der Von 18:00 abdeckt. |
| Dienstführende | `GET /rpt/api/normunitofevent/day/{dayId}` | Rollen = `name` der Personen-Positionen; Schichtzeit aus `shiftAssignment.shiftStartTime/shiftEndTime`, sonst Zeit der Position. |
| Bild einer Ambulanz | `GET /rpt/api/event/picture/{eventId}` | Liefert reines Base64 (meist PNG) als `application/json`. |
| Angemeldete Person | `GET /mpo/api/servicegateway/user` | `userName` („Vorname Nachname“) für die AMB-Unterschrift. |

Abgelaufene Sitzung erkennt die Referenzumsetzung an HTTP 401 oder einer Weiterleitung zur Anmeldung (Keycloak).

---

## Anhang B: Kontaktdaten und feste Texte

### Kontaktdaten je Bereich

| Bereich | Mail | Telefon | Berechtigung in der Fußzeile |
|---|---|---|---|
| KTW & N-KTW | KTW.Support@w.roteskreuz.at | 01/79580-1776 | SAN2 |
| Notfallrettung | nfrsupport@w.roteskreuz.at | 01/79580-1775 | SAN1 |
| Ambulanzen | amb-df@w.roteskreuz.at | 01/79580-1774 | SAN2 |

### Einleitung

**KTW:**

> In gewohnter Weise möchten wir dich über die offenen Positionen am KTW und N-KTW in den kommenden Tagen informieren.
> Es würde uns freuen, wenn du den einen oder anderen Dienst besetzen kannst. Wenn du bereits ein ganzes Team für einen Dienst hast, kannst du uns dieses genauso bekannt geben wie einen einzelnen Dienstwunsch!

**NFR** (`{KW}` = ISO-Kalenderwoche von Von):

> Gleich zum Wochenanfang möchten wir dich wie gewohnt über die offenen Positionen der Notfallrettung in der KW {KW} informieren.
> Es würde uns freuen, wenn du den einen oder anderen Dienst besetzen kannst. Wenn du bereits ein ganzes Team für einen Dienst hast, kannst du uns dieses genauso bekannt geben wie einen einzelnen Dienstwunsch!

**AMB:**

> In gewohnter Weise möchten wir dich über die offenen Positionen auf Ambulanzen der nächsten Tage informieren.

### Kontakttext (alle Bereiche)

> Für Änderungen, Splittings, Dienstzeitenanpassungen, uvm. zu bestehenden Diensten kannst du uns natürlich jederzeit via Email unter {Mail} oder per Telefon unter {Telefon} kontaktieren.
> Wir wünschen eine schöne Woche!

### Unterschrift

| Bereich | Text | Platzhalter |
|---|---|---|
| KTW, NFR | „Liebe Grüße,“ / {Dienstführende*r 1} & {Dienstführende*r 2} | „Dienstführende*r 1 & Dienstführende*r 2“ |
| AMB | „Liebe Grüße,“ / {Vorname Nachname} / „im Namen der Ambulanzdienstführung“ | „Vorname Nachname“ |

### Fußzeile (alle Bereiche)

> Du erhältst diese E-Mail weil du Mitglied im Roten Kreuz Landesverband Wien mit Status **AKTIV** oder **ZBV** mit der Berechtigung **{Berechtigung}** oder höher bist.

### Meldungen in der Ansicht

| Meldung | Wann |
|---|---|
| Lade Dienste … {n}/{gesamt} | Während des Ladens |
| Fertig. | Mail erstellt |
| Fertig. Keine offenen Positionen im Zeitraum gefunden. | Keine offene Position (Kopieren gesperrt) |
| Fertig. Keine Dienstführung gefunden, bitte Unterschrift prüfen. | KTW/NFR ohne ermittelte Unterschrift |
| Fertig. Kein Name gefunden, bitte Unterschrift prüfen. | AMB ohne Namen |
| „Bis“ muss nach „Von“ liegen. | Ungültiger Zeitraum |
| Die Portal-Sitzung ist abgelaufen. Bitte die Seite neu laden und anmelden. | Sitzung abgelaufen |
| Dienstwünsche: HTTP {Status} | Wünsche nicht ladbar, Abbruch |
| Kopiert. Jetzt in Outlook einfügen. | Nach dem Kopieren |
