# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`wochenmail.user.js` is a single-file Tampermonkey userscript for the WRK MPO portal (`https://portal.wrk.at/mpo/*`). It builds the weekly mail ("Wochenmail") listing open positions for **KTW & N-KTW**, **Notfallrettung (NFR)** and **Ambulanzen (AMB)**. The result is shown in a dialog and copied by hand into Outlook. Nothing is sent automatically; do not add sending.

UI text, commit messages and domain terms are German. Never commit secrets (cookies, tokens).

It is a port of `WochenmailController` from the Laravel app `wrkdpl` (https://github.com/danielsteiner/wrkdpl), which also covers the NFR summer CSV. That is not part of this script.

## How it works

- Runs inside the logged-in MPO page (`@grant none`) and calls the portal APIs with `fetch` and the browser session. There is no login, token or cookie handling of its own. 401 or a redirect into Keycloak is reported as an expired session.
- Adds a "Wochenmail" entry after "Kalenderabo" in the "Dienste" menu, by cloning an existing menu `<li>`. A MutationObserver re-adds it, because the MPO is an Angular app that re-renders the menu.
- Dialog: Bereich (ktw/nfr/amb), Von (default tomorrow), Bis (default Von + 8 days, exclusive, moves along with Von). The preview is an `iframe` (`srcdoc`). Double-clicking the date cell removes a row. The copy button writes `text/html` to the clipboard, so all mail styles are inline on purpose: Outlook drops `<style>` blocks.
- All times are handled in `Europe/Vienna` (helpers `vienna()` and `viennaDate()`), independent of the browser's time zone.

## Portal APIs used

- `GET /rpt/api/event/mpo/assigned?validFrom=…&validTo=…` returns the events in the range (ISO UTC).
- `GET /rpt/api/normunitofevent/day/{dayId}` returns vehicles (`parentId == null`) and their positions per event day.
- `POST /rpt/api/preferredassignment/ed/ids` with body `[dayId]` returns wishes. States 0–2 count as filled.
- `GET /rpt/api/event?visibleInMpo=true&personnelCapacityOnly=true&validFrom=…&validTo=…` is the MPO event list ("Dienste → Events"). It finds the support event. Without `visibleInMpo=true` the portal filters by RPT rights and NFR support is missing. Each event carries only one sub-day (the next one), not the covering one.
- `GET /rpt/api/event/{supportEventId}` returns the support event with all its days, used for the signature (duty leaders).
- `GET /rpt/api/event/picture/{eventId}` returns the AMB event picture as bare base64 (PNG), sent as `application/json`.
- `GET /mpo/api/servicegateway/user` returns the logged-in user; `userName` ("Vorname Nachname") is the AMB signature.

## Domain rules (keep when changing)

The full requirements (user stories with acceptance criteria, German) are in `docs/anforderungen.md`. They are the basis for a native implementation in the MPO. Update them in the same commit when a rule changes.

- **Event filter (KTW/NFR):** division `RD`; names containing Spezialdienste, Bereitschaft or Stationskoordination are skipped; at least one day must have `stateInMpo` 0–3.
- **Weekday day shifts** (start 05:00–16:59) are dropped, except on Vienna public holidays, in the Vienna summer holidays and (KTW only) for RKK vehicles.
- **KTW:**
  - Only optional vehicles are listed (RKK vehicles too only when optional).
  - Non-RKK vehicles starting 05:00–12:00 are dropped, on weekends and holidays as well.
  - RKK vehicles are exempt from the weekday day-shift rule above.
  - Only rows with 1–2 open positions appear.
  - Columns Lenker*in / SAN1 / SAN2 = positions 1 / 2 / 3.
- **NFR:**
  - Grid per day with rows Tag and Nacht and columns RKL1, RKL2, RKL3, RKS1, RKS2, RKP1, RKF1, RKI1.
  - Name suffixes such as `-N` / `-T` are normalized.
  - RKL1 Saturday day shifts count as filled.
  - The NAW position `NA` (emergency doctor) is not staffed via the mail and never counts as open (`FOREIGN_POSITIONS`).
- **Signature (duty leaders):**
  - Reference time is Von at 18:00. Take the support-event day covering the reference.
  - For each role (Hauptdienst, Beidienst, then others), pick the person whose own shift covers the reference: the shortest shift wins, otherwise the next one to start. Nobody is listed twice.
  - The KTW support plans whole weeks (Wed 18:00 to Wed 18:00) with partial shifts.
- **AMB:**
  - Events of division `AMB`, without Spezialdienste, `visibleInMpo` not false, event state 0–4.
  - Only event days starting within Von/Bis and with `stateInMpo` 0–3 (the original took all days of the event).
  - Open = position (`baseNormUnit.type === 'p'`) without shift assignment, subcontractor or wish (states 0–2). The original ignored wishes.
  - One block per ambulance (name, ambulance number, description truncated to 500 chars, picture as `<img>` data URI), sorted by first open position. Rows per day: required before optional.
  - Column Unterabschnitt (day name) only for ambulances that have one.
  - Signature: logged-in user "im Namen der Ambulanzdienstführung", no support event. Fixed intro text without the invitation sentence.
- **Support events** are found by their Dienstplanklasse (`division.name`): `RD-KTW-SUPPORT` / `RD-NFR-SUPPORT` (`supportDivision` in `TYPES`), as the event covering the reference time. If none is found, the signature shows a placeholder.
- **Intro texts** are fixed. NFR uses the ISO week of Von.

## Releases

- Tampermonkey updates the installed script from `main` on GitHub (`@updateURL` / `@downloadURL`) and only when `@version` is higher than the installed one. So bump `@version` with every change to `wochenmail.user.js` that should reach users. Use patch for fixes and minor for new features or changed rules.
- Changes to README or CLAUDE.md alone need no version bump.

## Testing

There is no build and there are no tests. To test, load the script into Chrome where the MPO is logged in (e.g. via Claude in Chrome): open "Dienste → Wochenmail", generate KTW, NFR and AMB, and check the rows against the MPO.
