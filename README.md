# MPO Wochenmail

Tampermonkey-Userscript für das MPO-Portal des WRK (`https://portal.wrk.at/mpo/`). Es erstellt die Wochenmail mit den offenen Positionen für **KTW & N-KTW** oder die **Notfallrettung (NFR)** direkt im Browser. Die fertige Mail wird in die Zwischenablage kopiert und von Hand in Outlook eingefügt. Das Script verschickt selbst nichts.

Das Script nutzt deine angemeldete MPO-Sitzung. Es braucht keine eigenen Zugangsdaten und sieht nur, was du im MPO auch siehst.

## Installation

### 1. Tampermonkey installieren

Die Erweiterung Tampermonkey für deinen Browser installieren:

- Chrome: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Edge: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- Firefox: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)

**Nur Chrome und Edge:** Userscripts müssen zusätzlich erlaubt werden, sonst läuft kein Script.

1. Rechtsklick auf das Tampermonkey-Symbol → *Erweiterung verwalten* (bzw. `chrome://extensions` öffnen und bei Tampermonkey auf *Details* klicken).
2. Den Schalter **Nutzerskripts zulassen** („Allow User Scripts“) einschalten.
   Bei älteren Browser-Versionen gibt es diesen Schalter nicht. Dann stattdessen oben rechts auf `chrome://extensions` den **Entwicklermodus** einschalten.

### 2. Script hinzufügen

1. Tampermonkey-Symbol → *Neues Script erstellen*.
2. Den vorhandenen Beispielinhalt komplett löschen.
3. Den gesamten Inhalt von [`wochenmail.user.js`](wochenmail.user.js) einfügen.
4. Mit `Strg+S` speichern.

Im Tampermonkey-Dashboard sollte jetzt „MPO Wochenmail“ aktiviert in der Liste stehen.

### 3. Prüfen

MPO öffnen bzw. neu laden. Im Menü unter **Dienste** steht nach „Kalenderabo“ der neue Eintrag **Wochenmail**.

## Aktualisieren

Das Script aktualisiert sich nicht automatisch. Bei einer neuen Version im Tampermonkey-Dashboard das Script „MPO Wochenmail“ öffnen, den Inhalt durch die neue Fassung von `wochenmail.user.js` ersetzen und speichern. Die installierte Version steht im Dashboard und im Script-Kopf (`@version`).

## Bedienung

1. Im MPO **Dienste → Wochenmail** öffnen.
2. Auswählen:
   - **Bereich:** KTW & N-KTW oder Notfallrettung.
   - **Von:** erster Tag der Mail, standardmäßig morgen.
   - **Bis:** erster Tag, der *nicht* mehr dabei ist, standardmäßig Von + 8 Tage. Wird Von geändert, wandert Bis mit und behält den Abstand.
3. **Erstellen** klicken. Das Laden dauert je nach Zeitraum einige Sekunden, der Fortschritt steht neben dem Button.
4. Die Vorschau prüfen. Einzelne Zeilen lassen sich mit einem **Doppelklick auf das Datum** entfernen.
5. **In Zwischenablage kopieren** klicken und in eine neue Outlook-Mail einfügen (`Strg+V`).

## Was in der Mail steht

**KTW & N-KTW:** eine Zeile pro Fahrzeug mit 1–2 offenen Positionen. Berücksichtigt werden RKK-Fahrzeuge und optionale Fahrzeuge.

**Notfallrettung:** eine Tabelle pro Tag mit den Zeilen Tag und Nacht und den Spalten RKL-1 bis RKI-1. Offene Positionen sind rot und verlinkt, besetzte Dienste haben ein Häkchen.

Für beide Bereiche gilt:

- Tagdienste unter der Woche fehlen, außer an Wiener Feiertagen und in den Wiener Sommerferien.
- Ein Dienstwunsch zählt bereits als besetzt.
- Die Notärzt*innen-Position (NA) am NAW wird nie als offen gezeigt.
- Unterschrieben wird mit den beiden Dienstführenden aus dem KTW- bzw. NFR-Support-Dienstplan, die am Von-Tag um 18:00 im Dienst sind.

## Häufige Meldungen

| Meldung | Bedeutung |
|---|---|
| Die Portal-Sitzung ist abgelaufen … | MPO-Seite neu laden, anmelden und noch einmal erstellen. |
| Keine offenen Positionen im Zeitraum gefunden. | Im Zeitraum ist alles besetzt, oder Von/Bis stimmen nicht. Kopieren ist dann gesperrt. |
| Keine Dienstführung gefunden, bitte Unterschrift prüfen. | Im Support-Dienstplan ist am Von-Tag um 18:00 niemand eingeteilt, oder das Support-Event für das Jahr fehlt noch. In der Mail steht ein Platzhalter, der von Hand ersetzt werden muss. |
| Dienstwünsche: HTTP … | Das Portal hat die Dienstwünsche nicht geliefert. Später noch einmal versuchen, sonst wären besetzte Positionen als offen markiert. |

Fehlt der Menüeintrag, prüfen ob Tampermonkey aktiv ist, das Script im Dashboard eingeschaltet ist und (Chrome/Edge) Userscripts erlaubt sind. Danach die MPO-Seite neu laden.

## Entwicklung

Es gibt keinen Build und keine automatischen Tests. Fachliche Regeln, verwendete Portal-Schnittstellen und Hinweise zum Testen stehen in [`CLAUDE.md`](CLAUDE.md).
