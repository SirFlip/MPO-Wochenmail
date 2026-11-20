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

### 2. Script installieren

**[➜ MPO Wochenmail installieren](https://raw.githubusercontent.com/SirFlip/mpo-wochenmail/main/wochenmail.user.js)**

Tampermonkey öffnet eine Installationsseite. Dort auf **Installieren** klicken. Im Tampermonkey-Dashboard steht danach „MPO Wochenmail“ aktiviert in der Liste.

Öffnet sich stattdessen nur der Quelltext, ist Tampermonkey nicht aktiv oder (Chrome/Edge) sind Userscripts nicht erlaubt, siehe Schritt 1.

### 3. Prüfen

MPO öffnen bzw. neu laden. Im Menü unter **Dienste** steht nach „Kalenderabo“ der neue Eintrag **Wochenmail**.

## Aktualisieren

Tampermonkey sucht selbst nach neuen Versionen (standardmäßig täglich) und installiert sie. Sofort aktualisieren: Tampermonkey-Symbol → *Dashboard* → bei „MPO Wochenmail“ auf die Versionsnummer bzw. *Nach Updates suchen* klicken, oder einfach den Installationslink oben noch einmal öffnen.

**Script früher von Hand eingefügt?** Dann kennt Tampermonkey die Update-Adresse noch nicht. Einmal den Installationslink oben öffnen und das bestehende Script damit ersetzen lassen, danach kommen Updates automatisch.

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

**KTW & N-KTW:** eine Zeile pro Fahrzeug mit 1–2 offenen Positionen. Berücksichtigt werden nur optionale Fahrzeuge. Fahrzeuge ohne RKK mit Dienstbeginn zwischen 05:00 und 12:00 fehlen. RKK-Fahrzeuge erscheinen auch unter der Woche tagsüber.

**Notfallrettung:** eine Tabelle pro Tag mit den Zeilen Tag und Nacht und den Spalten RKL-1 bis RKI-1. Offene Positionen sind rot und verlinkt, besetzte Dienste haben ein Häkchen.

Für beide Bereiche gilt:

- Tagdienste unter der Woche fehlen, außer an Wiener Feiertagen und in den Wiener Sommerferien (bei KTW außerdem außer bei RKK-Fahrzeugen).
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

## Herkunft

Die Logik stammt aus [wrkdpl](https://github.com/danielsteiner/wrkdpl) von Daniel Steiner ([@danielsteiner](https://github.com/danielsteiner)), einer Laravel-App mit Werkzeugen für den WRK-Dienstbetrieb. Dieses Script ist eine Portierung des dortigen Wochenmail-Generators (`WochenmailController`) als Userscript, beschränkt auf KTW und NFR.

## Lizenz

MIT, wie wrkdpl. Siehe [`LICENSE`](LICENSE).

## Entwicklung

Es gibt keinen Build und keine automatischen Tests. Fachliche Regeln, verwendete Portal-Schnittstellen und Hinweise zum Testen stehen in [`CLAUDE.md`](CLAUDE.md).
