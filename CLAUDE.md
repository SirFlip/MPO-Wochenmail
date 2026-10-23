# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`wochenmail.user.js` is a single-file Tampermonkey userscript for the WRK MPO portal (`https://portal.wrk.at/mpo/*`). It builds the weekly mail ("Wochenmail") listing open positions for **KTW & N-KTW** and **Notfallrettung (NFR)**. The result is shown in a dialog and copied by hand into Outlook. Nothing is sent automatically; do not add sending.

UI text, commit messages and domain terms are German. Never commit secrets (cookies, tokens).

It is a port of `WochenmailController` from the Laravel app `wrkdpl` (https://github.com/danielsteiner/wrkdpl), which also covers AMB and the NFR summer CSV. Neither of those is part of this script.

## How it works

- Runs inside the logged-in MPO page (`@grant none`) and calls the portal APIs with `fetch` and the browser session. There is no login, token or cookie handling of its own. 401 or a redirect into Keycloak is reported as an expired session.
- Adds a "Wochenmail" entry after "Kalenderabo" in the "Dienste" menu, by cloning an existing menu `<li>`. A MutationObserver re-adds it, because the MPO is an Angular app that re-renders the menu.
- Dialog: Bereich (ktw/nfr), Von (default tomorrow), Bis (default Von + 8 days, exclusive, moves along with Von). The preview is an `iframe` (`srcdoc`). Double-clicking the date cell removes a row. The copy button writes `text/html` to the clipboard, so all mail styles are inline on purpose: Outlook drops `<style>` blocks.
- All times are handled in `Europe/Vienna` (helpers `vienna()` and `viennaDate()`), independent of the browser's time zone.

## Portal APIs used

- `GET /rpt/api/event/mpo/assigned?validFrom=…&validTo=…` returns the events in the range (ISO UTC).
- `GET /rpt/api/normunitofevent/day/{dayId}` returns vehicles (`parentId == null`) and their positions per event day.
- `POST /rpt/api/preferredassignment/ed/ids` with body `[dayId]` returns wishes. States 0–2 count as filled.
- `GET /rpt/api/event/{supportEventId}` returns the support event used for the signature (duty leaders).

## Domain rules (keep when changing)

- **Event filter:** division `RD`; names containing Spezialdienste, Bereitschaft or Stationskoordination are skipped; at least one day must have `stateInMpo` 0–3.
- **Weekday day shifts** (start 05:00–16:59) are dropped, except on Vienna public holidays and in the Vienna summer holidays.
- **KTW:**
  - Only optional vehicles or ones named `RKK…` are listed.
  - Non-RKK vehicles starting 05:00–12:00 are dropped.
  - Only rows with 1–2 open positions appear.
  - Columns Lenker*in / SAN1 / SAN2 = positions 1 / 2 / 3.
- **NFR:**
  - Grid per day with rows Tag and Nacht and columns RKL1, RKL2, RKL3, RKS1, RKS2, RKP1, RKF1, RKI1.
  - Name suffixes such as `-N` / `-T` are normalized.
  - RKL1 Saturday day shifts count as filled.
- **Signature (duty leaders):**
  - Reference time is Von at 18:00. Take the support-event day covering the reference.
  - For each role (Hauptdienst, Beidienst, then others), pick the person whose own shift covers the reference: the shortest shift wins, otherwise the next one to start. Nobody is listed twice.
  - The KTW support plans whole weeks (Wed 18:00 to Wed 18:00) with partial shifts.
- **Support event IDs** are hard-coded per year in `SUPPORT_EVENTS`. They have to be added each new year, otherwise the signature shows a placeholder.
- **Intro texts** are fixed. NFR uses the ISO week of Von.

## Testing

There is no build and there are no tests. To test, load the script into Chrome where the MPO is logged in (e.g. via Claude in Chrome): open "Dienste → Wochenmail", generate KTW and NFR, and check the rows against the MPO.
