// ==UserScript==
// @name         MPO Wochenmail
// @namespace    https://portal.wrk.at/wrkdpl
// @version      1.1.0
// @description  Wochenmail mit den offenen KTW- und NFR-Positionen direkt im MPO erstellen und nach Outlook kopieren.
// @match        https://portal.wrk.at/mpo/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// Läuft in der angemeldeten MPO-Seite: Alle Abfragen gehen mit der Browser-Sitzung
// an dieselben Portal-Schnittstellen wie die Laravel-App (WochenmailController).

(function () {
    'use strict';

    const TZ = 'Europe/Vienna';
    const PARALLEL = 6;

    const TYPES = {
        ktw: {
            label: 'KTW',
            vehicleTypes: ['KTW', 'NKTW'],
            email: 'KTW.Support@w.roteskreuz.at',
            tel: '01/79580-1776',
            tellink: '+431795801776',
            permission: 'SAN2',
            supportDivision: 'RD-KTW-SUPPORT',
            width: 700,
        },
        nfr: {
            label: 'NFR',
            vehicleTypes: ['RTW', 'NAW'],
            email: 'nfrsupport@w.roteskreuz.at',
            tel: '01/79580-1775',
            tellink: '+431795801775',
            permission: 'SAN1',
            supportDivision: 'RD-NFR-SUPPORT',
            width: 900,
        },
    };

    const UNWANTED_EVENTS = ['Spezialdienste', 'Bereitschaft', 'Stationskoordination'];
    const VALID_EVENT_STATES = [0, 1, 2, 3, 4];
    const ALLOWED_STATE_IN_MPO = [0, 1, 2, 3];
    const ALLOWED_PREFERRED_ASSIGNMENT_STATES = [0, 1, 2];
    // quick hack in case a normunit is on the wrong position
    const BLOCKED_NAMES = ['RTW KFZ', 'RTW-NAW F', 'NFR 1', 'SAN 1', 'N-KTW KFZ', 'KTW KFZ', 'KTW F', 'SAN 2', 'FSD SR FahrerIn', 'PKW KFZ', 'PKW F'];
    const NFR_COLUMNS = ['RKL1', 'RKL2', 'RKL3', 'RKS1', 'RKS2', 'RKP1', 'RKF1', 'RKI1'];
    // Positionen, die nicht über die Wochenmail besetzt werden (Notärzt*in am NAW)
    const FOREIGN_POSITIONS = ['NA'];

    // ---------------------------------------------------------------- Zeit

    const pad = (n) => String(n).padStart(2, '0');
    const partsFormat = new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
    });
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const WEEKDAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const WEEKDAYS_DE_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

    /** Wanduhrzeit in Wien. */
    function vienna(date) {
        const p = Object.fromEntries(partsFormat.formatToParts(date).map((x) => [x.type, x.value]));
        return {
            y: +p.year, m: +p.month, d: +p.day, H: +p.hour, M: +p.minute,
            ymd: `${p.year}-${p.month}-${p.day}`,
            dow: WEEKDAYS.indexOf(p.weekday),
        };
    }

    /** Zeitpunkt zur Wiener Wanduhrzeit ymd H:M. */
    function viennaDate(ymd, H = 0, M = 0) {
        const [y, m, d] = ymd.split('-').map(Number);
        const wall = Date.UTC(y, m - 1, d, H, M);
        let t = wall;
        for (let i = 0; i < 2; i++) {
            const v = vienna(new Date(t));
            t += wall - Date.UTC(v.y, v.m - 1, v.d, v.H, v.M);
        }
        return new Date(t);
    }

    function addDays(ymd, n) {
        const [y, m, d] = ymd.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
    }

    function daysBetween(fromYmd, toYmd) {
        return Math.round((Date.parse(toYmd) - Date.parse(fromYmd)) / 86400000);
    }

    function weekday(ymd) {
        return new Date(ymd + 'T00:00:00Z').getUTCDay();
    }

    function isoWeek(ymd) {
        const date = new Date(ymd + 'T00:00:00Z');
        const dow = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dow);
        const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
        return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    }

    function easter(y) {
        const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
        const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h - 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
        return `${y}-${pad(month)}-${pad(day)}`;
    }

    const holidayCache = {};
    /** Gesetzliche Feiertage in Wien (inkl. Leopolditag). */
    function holidays(y) {
        if (!holidayCache[y]) {
            const e = easter(y);
            holidayCache[y] = new Set([
                ...['01-01', '01-06', '05-01', '08-15', '10-26', '11-01', '11-15', '12-08', '12-25', '12-26'].map((md) => `${y}-${md}`),
                ...[0, 1, 39, 49, 50, 60].map((n) => addDays(e, n)),
            ]);
        }
        return holidayCache[y];
    }

    const isHoliday = (v) => holidays(v.y).has(v.ymd);
    const isDayShift = (v) => v.H >= 5 && v.H <= 16;

    /** Wiener Sommerferien (Samstag vor dem ersten Juli-Montag bis Freitag vor dem ersten September-Montag). */
    function isSummerHoliday(v) {
        const june29 = `${v.y}-06-29`;
        const start = addDays(june29, ((1 - weekday(june29) + 7) % 7 || 7) - 2);
        const sept1 = `${v.y}-09-01`;
        const firstMondaySept = addDays(sept1, (1 - weekday(sept1) + 7) % 7);
        return v.ymd >= start && v.ymd <= addDays(firstMondaySept, -3);
    }

    // ---------------------------------------------------------------- Portal

    class SessionExpired extends Error {}

    async function api(path, init = {}) {
        const response = await fetch(path, {
            credentials: 'same-origin',
            ...init,
            headers: { Accept: 'application/json', ...(init.headers || {}) },
        });
        if (response.status === 401 || (response.redirected && /oauth2|openid-connect/.test(response.url))) {
            throw new SessionExpired('Die Portal-Sitzung ist abgelaufen. Bitte die Seite neu laden und anmelden.');
        }
        return response;
    }

    async function getJson(path) {
        const response = await api(path);
        if (!response.ok) {
            throw new Error(`${path}: HTTP ${response.status}`);
        }
        return response.json();
    }

    async function preferredAssignments(dayId) {
        const response = await api('/rpt/api/preferredassignment/ed/ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([dayId]),
        });
        // Ohne Wünsche würden besetzte Positionen als offen erscheinen.
        if (!response.ok) {
            throw new Error(`Dienstwünsche: HTTP ${response.status}`);
        }
        const list = await response.json().catch(() => []);
        return (list || []).filter((p) => ALLOWED_PREFERRED_ASSIGNMENT_STATES.includes(p.preferredAssignmentState?.id));
    }

    /** Führt die Aufgaben mit höchstens `limit` gleichzeitigen Abfragen aus. */
    async function pool(tasks, limit, onProgress) {
        const results = new Array(tasks.length);
        let next = 0, done = 0;
        async function worker() {
            while (next < tasks.length) {
                const i = next++;
                results[i] = await tasks[i]();
                onProgress(++done, tasks.length);
            }
        }
        await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
        return results;
    }

    /** Fahrzeuge mit ihren Positionen je Tag (Y-m-d), wie getRosters() in der App. */
    async function loadRoster(type, startYmd, endYmd, onProgress) {
        const config = TYPES[type];
        const from = viennaDate(startYmd).toISOString();
        const to = viennaDate(endYmd).toISOString();
        const events = await getJson(`/rpt/api/event/mpo/assigned?&validFrom=${from}&validTo=${to}`) || [];

        const days = [];
        for (const event of events) {
            if (event.division?.name !== 'RD') continue;
            if (UNWANTED_EVENTS.some((name) => event.name.includes(name))) continue;
            if (!VALID_EVENT_STATES.includes(event.eventState?.id)) continue;
            if (!event.days.some((day) => ALLOWED_STATE_IN_MPO.includes(day.stateInMpo?.id))) continue;
            for (const day of event.days) {
                days.push({ event, day });
            }
        }

        const loaded = await pool(days.map(({ day }) => async () => {
            const [normUnits, preferred] = await Promise.all([
                getJson(`/rpt/api/normunitofevent/day/${day.id}`),
                preferredAssignments(day.id),
            ]);
            return { normUnits: normUnits || [], preferred };
        }), PARALLEL, onProgress);

        const roster = new Map();
        days.forEach(({ event, day }, index) => {
            const { normUnits, preferred } = loaded[index];
            const date = vienna(new Date(day.startTime)).ymd;
            if (!roster.has(date)) roster.set(date, new Map());
            const vehicles = roster.get(date);
            for (const unit of normUnits) {
                if (unit.baseNormUnit.type === 'c' && !config.vehicleTypes.includes(unit.baseNormUnit.name)) continue;
                if (unit.parentId == null) {
                    unit.positions = [];
                    vehicles.set(unit.id, unit);
                } else if (vehicles.has(unit.parentId)) {
                    const vehicle = vehicles.get(unit.parentId);
                    vehicle.positions.push(unit);
                    vehicle.link = `https://portal.wrk.at/mpo/rpt/mpoevent/${event.id}?day=${day.id}&shiftlink=${unit.id}&row=${unit.id}`;
                    for (const position of vehicle.positions) {
                        const wish = preferred.find((p) => p.normUnitOfEventId === position.id);
                        if (wish) position.shiftAssignment = wish;
                    }
                }
            }
        });
        return new Map([...roster.entries()].sort(([a], [b]) => a.localeCompare(b)));
    }

    const NAME_MAPPING = {};
    for (const base of NFR_COLUMNS) {
        const dashed = base.slice(0, 3) + '-' + base.slice(3);
        for (const suffix of ['N', 'T']) {
            NAME_MAPPING[`${base}-${suffix}`] = base;
            NAME_MAPPING[`${dashed}${suffix}`] = base;
        }
    }

    /** Aufbereitung je Fahrzeug, wie formatData() in der App. */
    function formatRoster(type, roster) {
        const days = new Map();
        for (const vehicles of roster.values()) {
            for (const vehicle of vehicles.values()) {
                const start = new Date(vehicle.startTime);
                const v = vienna(start);
                const dayShift = isDayShift(v);
                const holiday = isHoliday(v);
                const helpWanted = isSummerHoliday(v);

                if (v.dow !== 6 && v.dow !== 0 && !helpWanted && dayShift && !holiday) continue;
                if (BLOCKED_NAMES.includes(vehicle.name)) continue;

                const separator = vehicle.name.indexOf(' - ');
                let name = vehicle.name.substring(separator === -1 ? 3 : separator + 3);
                name = NAME_MAPPING[name] || name;

                const shift = {
                    name,
                    start,
                    end: new Date(vehicle.endTime),
                    location: vehicle.startLocation?.name ?? '',
                    isDayShift: dayShift,
                    isHoliday: holiday || (type === 'nfr' && helpWanted),
                    optional: vehicle.optional,
                    link: vehicle.link,
                    open: vehicle.positions
                        .filter((p) => p.baseNormUnit.type !== 'm' && p.shiftAssignment == null)
                        .filter((p) => !FOREIGN_POSITIONS.includes(p.baseNormUnit.name))
                        .map((p) => p.baseNormUnit.name),
                    pos: {},
                    remark: '',
                };
                vehicle.positions.forEach((p, i) => {
                    if (p.baseNormUnit.type === 'p') {
                        shift.pos[i] = p.shiftAssignment;
                        if (p.description != null) shift.remark = p.description;
                    }
                });
                // RKL1 Samstag-Tagdienste werden von Hauptberuflichen besetzt
                if (name === 'RKL1' && dayShift && v.dow === 6) {
                    shift.open = [];
                }

                if (!days.has(v.ymd)) days.set(v.ymd, type === 'nfr' ? { Tag: null, Nacht: null } : []);
                const day = days.get(v.ymd);
                if (type === 'nfr') {
                    const column = NFR_COLUMNS.indexOf(name);
                    if (column === -1) continue;
                    const half = dayShift ? 'Tag' : 'Nacht';
                    day[half] = day[half] || [];
                    day[half][column] = shift;
                } else {
                    day.push(shift);
                }
            }
        }
        return days;
    }

    /**
     * Dienstführung zum Zeitpunkt reference: je Rolle (Hauptdienst, Beidienst,
     * dann weitere) die Person, deren Schicht ihn abdeckt; bei mehreren die
     * kürzeste Schicht, sonst die als Nächstes beginnende. Niemand doppelt.
     */
    function selectDutyLeaders(normUnits, reference) {
        const candidates = [];
        for (const unit of normUnits) {
            if (unit.baseNormUnit?.type !== 'p' || !unit.shiftAssignment) continue;
            const assignment = unit.shiftAssignment;
            const start = new Date(assignment.shiftStartTime ?? unit.startTime);
            const end = new Date(assignment.shiftEndTime ?? unit.endTime);
            candidates.push({
                role: unit.name,
                employee: assignment.employment.employee,
                start,
                covers: start <= reference && end > reference,
                duration: end - start,
            });
        }
        const roles = [...new Set(['Hauptdienst', 'Beidienst', ...candidates.map((c) => c.role)])];
        const team = [];
        for (const role of roles) {
            const forRole = candidates.filter((c) => c.role === role && !team.some((e) => e.id === c.employee.id));
            const covering = forRole.filter((c) => c.covers).sort((a, b) => a.duration - b.duration);
            const upcoming = forRole.filter((c) => c.start > reference).sort((a, b) => a.start - b.start);
            const pick = covering[0] || upcoming[0];
            if (pick) team.push(pick.employee);
        }
        return team;
    }

    /**
     * Support-Event mit der Dienstführung zum Zeitpunkt reference, gefunden über
     * die Dienstplanklasse. visibleInMpo=true wie die MPO-Eventliste, sonst
     * filtert das Portal nach den RPT-Rechten.
     */
    async function findSupportEvent(type, reference) {
        const from = reference.toISOString();
        const to = new Date(reference.getTime() + 60000).toISOString();
        const events = await getJson(`/rpt/api/event?visibleInMpo=true&personnelCapacityOnly=true&validFrom=${from}&validTo=${to}`) || [];
        return events.find((event) => event.division?.name === TYPES[type].supportDivision);
    }

    async function loadDutyLeaders(type, startYmd) {
        const reference = viennaDate(startYmd, 18, 0);
        const support = await findSupportEvent(type, reference);
        if (!support) return [];
        // Die Liste enthält nur einen Subtag, daher das ganze Event laden.
        const response = await api(`/rpt/api/event/${support.id}`);
        if (!response.ok) return [];
        const event = await response.json();
        const day = (event?.days || []).find((d) => new Date(d.startTime) <= reference && new Date(d.endTime) > reference);
        if (!day) return [];
        return selectDutyLeaders(await getJson(`/rpt/api/normunitofevent/day/${day.id}`) || [], reference);
    }

    // ---------------------------------------------------------------- Vorlage

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const hm = (date) => { const v = vienna(date); return `${pad(v.H)}:${pad(v.M)}`; };
    const fullName = (assignment) => `${assignment.employment.employee.firstName} ${assignment.employment.employee.lastName}`;

    const FONT = "font-family:'Conv_Dunant-Regular','Dunant',Arial,sans-serif;";
    const TEXT = `${FONT}text-align:left;color:#737373;font-size:14px;font-weight:normal;line-height:19px;margin:0;`;
    const TH = `${FONT}border:1px solid #eee;border-top:0;padding:5px;color:#737373;font-size:16px;font-weight:bold;line-height:19px;text-align:center;`;
    const TD = `${FONT}border:none;padding:5px;color:#737373;font-size:14px;font-weight:normal;line-height:19px;text-align:center;`;
    const TD_FIRST = `${TD}font-weight:bold;text-align:left;`;
    const LINK = `${FONT}color:#382F2E;`;
    const RED = 'color:#bb0000;';
    const STRIPE = '#eeeeee';

    function intro(type, startYmd) {
        const invitation = 'Es würde uns freuen, wenn du den einen oder anderen Dienst besetzen kannst. Wenn du bereits ein ganzes Team für einen Dienst hast, kannst du uns dieses genauso bekannt geben wie einen einzelnen Dienstwunsch!';
        return type === 'nfr'
            ? `Gleich zum Wochenanfang möchten wir dich wie gewohnt über die offenen Positionen der Notfallrettung in der KW ${isoWeek(startYmd)} informieren.\n${invitation}`
            : `In gewohnter Weise möchten wir dich über die offenen Positionen am KTW und N-KTW in den kommenden Tagen informieren.\n${invitation}`;
    }

    function headerRow(columns) {
        const last = columns.length - 1;
        return '<tr style="background-color:#eeeeee;">' + columns.map((c, i) => {
            const extra = (i === 0 ? 'border-left:0;text-align:left;' : '') + (i === last ? 'border-right:0;' : '');
            return `<th${c.colspan ? ` colspan="${c.colspan}"` : ''} style="${TH}${extra}">${esc(c.label)}</th>`;
        }).join('') + '</tr>';
    }

    function ktwRows(days) {
        let rows = '';
        for (const [ymd, shifts] of days) {
            const [, m, d] = ymd.split('-');
            for (const shift of shifts) {
                const rkk = shift.name.includes('RKK');
                if (!rkk && !shift.optional) continue;
                const v = vienna(shift.start);
                const minutes = v.H * 60 + v.M;
                if (!rkk && minutes >= 5 * 60 && minutes <= 12 * 60) continue;
                if (shift.open.length === 0 || shift.open.length >= 3) continue;
                const person = (i) => shift.pos[i]
                    ? `${esc(fullName(shift.pos[i]))} (${esc(shift.pos[i].employment.employmentNumber)})`
                    : `<span style="${RED}">Offen</span>`;
                rows += '<tr>'
                    + `<td style="${TD_FIRST}">${WEEKDAYS_DE_SHORT[weekday(ymd)]} ${d}.${m}</td>`
                    + `<td style="${TD}">${hm(shift.start)} - ${hm(shift.end)}</td>`
                    + `<td style="${TD}">${rkk ? esc(shift.name) : 'KTW'}</td>`
                    + `<td style="${TD}">${esc(shift.location)}</td>`
                    + `<td style="${TD}">${person(1)}</td>`
                    + `<td style="${TD}">${person(2)}</td>`
                    + `<td style="${TD}">${person(3)}</td>`
                    + `<td style="${TD}">${esc(shift.remark)}</td>`
                    + `<td style="${TD}"><a href="${esc(shift.link)}" target="_blank" style="${LINK}">MPO  Link</a></td>`
                    + '</tr>';
            }
        }
        return rows;
    }

    function nfrCell(half, ymd, shift) {
        if (!shift) {
            return half === 'Tag' ? '✔️' : 'Ganzes Team <br><small>(auf Anfrage)</small>';
        }
        const wd = weekday(ymd);
        if (shift.isDayShift && wd >= 1 && wd <= 5 && !shift.isHoliday) {
            return '✔️';
        }
        const link = (label) => `<a href="${esc(shift.link)}" target="_blank" style="${LINK}">${label}</a>`;
        if (shift.open.length === 3) return link('Ganzes Team');
        if (shift.open.length === 0) return '✔️';
        const labels = { 'RTW-NAW F': 'Lenker', 'NFR 1': 'NFR1', 'SAN 1': 'NFR2 / SAN1' };
        const open = shift.open.map((p, j) => link(`<span style="${RED}">${labels[p] ?? esc(p)}${shift.open.length === 2 && j === 0 ? ' &amp;' : ''}</span>`)).join(' ');
        const names = [1, 2, 3].filter((i) => shift.pos[i]).map((i) => esc(fullName(shift.pos[i])));
        return `${open}<br><small>mit ${names.join(', ')}</small>`;
    }

    function nfrRows(days) {
        let rows = '';
        for (const [ymd, halves] of days) {
            const [, m, d] = ymd.split('-');
            for (const half of ['Tag', 'Nacht']) {
                if (!halves[half]) continue;
                rows += '<tr>'
                    + `<td colspan="3" style="${TD_FIRST}"><span style="white-space:nowrap;">${WEEKDAYS_DE[weekday(ymd)]}, ${+d}.${+m}</span><br>${half}</td>`
                    + NFR_COLUMNS.map((_, i) => `<td style="${TD}">${nfrCell(half, ymd, halves[half][i])}</td>`).join('')
                    + '</tr>';
            }
        }
        return rows;
    }

    function renderMail(type, startYmd, days, leaders) {
        const config = TYPES[type];
        const title = type === 'nfr'
            ? 'Offene Positionen in der <span style="color:#B70E0C;">Notfallrettung</span>'
            : 'Offene Positionen am <span style="color:#B70E0C;">KTW &amp; N-KTW</span>';
        const columns = type === 'nfr'
            ? [{ label: 'Datum', colspan: 3 }, ...['RKL-1', 'RKL-2', 'RKL-3', 'RKS-1', 'RKS-2', 'RKP-1', 'RKF-1', 'RKI-1'].map((label) => ({ label }))]
            : ['Datum', 'Dienstzeit', 'Fahrzeug', 'Bezirkstelle', 'Lenker*in', 'SAN1', 'SAN2', 'Anmerkung', 'MPO Link'].map((label) => ({ label }));
        const signature = leaders.length
            ? leaders.slice(0, 2).map((e) => esc(`${e.firstName} ${e.lastName}`)).join(' &amp; ')
            : 'Dienstführende*r 1 &amp; Dienstführende*r 2';
        const spacer = (height) => `<tr><td valign="top" height="${height}" style="height:${height}px;">&nbsp;</td></tr>`;
        const grey = 'color:#cccccc;';

        return `<table width="${config.width}" align="center" border="0" cellspacing="0" cellpadding="0" style="${FONT}background:#ffffff;border:0;width:${config.width}px;color:#737373;">
<tbody>
${spacer(35)}
<tr><td><p style="${FONT}font-size:26px;line-height:30px;text-align:center;color:#737373;margin:0;">${title}</p></td></tr>
${spacer(15)}
<tr><td><h2 style="${FONT}text-align:left;color:#222222;font-size:19px;font-weight:normal;margin:0;">Liebe Kolleg*innen,</h2></td></tr>
${spacer(15)}
<tr><td><p style="${TEXT}">${esc(intro(type, startYmd))}</p></td></tr>
<tr><td>
<table class="duties" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:30px 0;width:100%;">
<thead>${headerRow(columns)}</thead>
<tbody>${type === 'nfr' ? nfrRows(days) : ktwRows(days)}</tbody>
</table>
</td></tr>
<tr><td><p style="${TEXT}">Für Änderungen, Splittings, Dienstzeitenanpassungen, uvm. zu bestehenden Diensten kannst du uns natürlich jederzeit via Email unter <a href="mailto:${config.email}" style="color:#B70E0C;">${config.email}</a> oder per Telefon unter <a href="tel:${config.tellink}" style="color:#B70E0C;">${config.tel}</a> kontaktieren.<br>Wir wünschen eine schöne Woche!</p></td></tr>
${spacer(15)}
<tr><td><p style="${TEXT}">Liebe Grüße,<br><span style="color:#222222;">${signature}</span></p></td></tr>
${spacer(65)}
<tr><td><p style="${FONT}${grey}text-align:left;font-size:12px;font-weight:normal;line-height:20px;margin:0;">Du erhältst diese E-Mail weil du Mitglied im Roten Kreuz Landesverband Wien mit Status <b style="${grey}">AKTIV</b> oder <b style="${grey}">ZBV</b> mit der Berechtigung <b style="${grey}">${config.permission}</b> oder höher bist.</p></td></tr>
</tbody>
</table>`;
    }

    /** Zebrastreifen der Dienst-Tabelle, nach jedem Löschen neu. */
    function stripe(doc) {
        doc.querySelectorAll('table.duties > tbody > tr').forEach((row, i) => {
            row.style.backgroundColor = i % 2 === 1 ? STRIPE : '';
        });
    }

    // ---------------------------------------------------------------- Oberfläche

    const CSS = `
.wm-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font-family:inherit}
.wm-dialog{background:#fff;color:#333;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.3);width:min(1000px,96vw);height:min(900px,94vh);display:flex;flex-direction:column;overflow:hidden}
.wm-head{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e5e7eb}
.wm-head h3{margin:0;font-size:18px;color:#1e3a8a}
.wm-close{background:none;border:0;font-size:22px;cursor:pointer;color:#666;line-height:1}
.wm-form{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:flex-end;padding:14px 20px;border-bottom:1px solid #e5e7eb}
.wm-form label{display:flex;flex-direction:column;font-size:12px;color:#555;gap:4px}
.wm-form input,.wm-form select{font:inherit;font-size:14px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:4px}
.wm-btn{font:inherit;font-size:14px;padding:7px 14px;border-radius:4px;border:1px solid #1e3a8a;background:#1e3a8a;color:#fff;cursor:pointer}
.wm-btn.wm-secondary{background:#fff;color:#1e3a8a}
.wm-btn:disabled{opacity:.5;cursor:default}
.wm-status{font-size:13px;color:#555;flex:1;min-width:200px}
.wm-status.wm-error{color:#b70e0c}
.wm-preview{flex:1;border:0;width:100%;background:#fff}
.wm-foot{display:flex;gap:12px;align-items:center;padding:10px 20px;border-top:1px solid #e5e7eb;font-size:12px;color:#666}
.wm-foot span{flex:1}
`;

    let dialog = null;

    function openDialog() {
        if (dialog) {
            dialog.overlay.style.display = 'flex';
            return;
        }
        if (!document.getElementById('wm-style')) {
            const style = document.createElement('style');
            style.id = 'wm-style';
            style.textContent = CSS;
            document.head.appendChild(style);
        }
        const tomorrow = addDays(vienna(new Date()).ymd, 1);
        const overlay = document.createElement('div');
        overlay.className = 'wm-overlay';
        overlay.innerHTML = `
<div class="wm-dialog" role="dialog" aria-label="Wochenmail">
  <div class="wm-head"><h3>Wochenmail</h3><button type="button" class="wm-close" title="Schließen">×</button></div>
  <form class="wm-form">
    <label>Bereich<select name="type"><option value="ktw">KTW &amp; N-KTW</option><option value="nfr">Notfallrettung</option></select></label>
    <label>Von<input type="date" name="start" required value="${tomorrow}"></label>
    <label>Bis<input type="date" name="end" required value="${addDays(tomorrow, 8)}"></label>
    <button type="submit" class="wm-btn">Erstellen</button>
    <div class="wm-status"></div>
  </form>
  <iframe class="wm-preview" title="Vorschau"></iframe>
  <div class="wm-foot">
    <span>Doppelklick aufs Datum entfernt eine Zeile.</span>
    <button type="button" class="wm-btn" data-copy disabled>In Zwischenablage kopieren</button>
  </div>
</div>`;
        document.body.appendChild(overlay);

        const form = overlay.querySelector('form');
        const status = overlay.querySelector('.wm-status');
        const frame = overlay.querySelector('iframe');
        const copyButton = overlay.querySelector('[data-copy]');
        const submit = form.querySelector('[type=submit]');
        let gap = 8;
        let run = 0;

        const setStatus = (text, error = false) => {
            status.textContent = text;
            status.classList.toggle('wm-error', error);
        };
        const close = () => { overlay.style.display = 'none'; };

        overlay.querySelector('.wm-close').addEventListener('click', close);
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.style.display !== 'none') close(); });

        // Bis wandert mit Von und behält den Abstand.
        form.start.addEventListener('change', () => {
            if (form.start.value) form.end.value = addDays(form.start.value, gap);
        });
        form.end.addEventListener('change', () => {
            if (form.start.value && form.end.value) gap = daysBetween(form.start.value, form.end.value);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = form.type.value, start = form.start.value, end = form.end.value;
            if (!start || !end || end <= start) {
                setStatus('„Bis“ muss nach „Von“ liegen.', true);
                return;
            }
            const current = ++run;
            submit.disabled = true;
            copyButton.disabled = true;
            setStatus('Lade Dienste …');
            try {
                const [roster, leaders] = await Promise.all([
                    loadRoster(type, start, end, (done, total) => {
                        if (current === run) setStatus(`Lade Dienste … ${done}/${total}`);
                    }),
                    loadDutyLeaders(type, start).catch((error) => {
                        if (error instanceof SessionExpired) throw error;
                        return [];
                    }),
                ]);
                if (current !== run) return;
                const html = renderMail(type, start, formatRoster(type, roster), leaders);
                frame.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Wochenmail</title></head><body style="margin:0;background:#ffffff;">${html}</body></html>`;
                frame.onload = () => {
                    if (current !== run) return;
                    const doc = frame.contentDocument;
                    stripe(doc);
                    doc.querySelectorAll('table.duties > tbody > tr > td:first-child').forEach((cell) => {
                        cell.addEventListener('dblclick', () => {
                            doc.getSelection()?.removeAllRanges();
                            cell.parentElement.remove();
                            stripe(doc);
                        });
                    });
                    // Jede offene Position ist in der Tabelle verlinkt (KTW je Zeile, NFR je Zelle).
                    if (!doc.querySelector('table.duties > tbody a')) {
                        setStatus('Fertig. Keine offenen Positionen im Zeitraum gefunden.', true);
                        return;
                    }
                    copyButton.disabled = false;
                    setStatus(`Fertig.${leaders.length ? '' : ' Keine Dienstführung gefunden, bitte Unterschrift prüfen.'}`, !leaders.length);
                };
            } catch (error) {
                if (current === run) setStatus(error.message || String(error), true);
            } finally {
                if (current === run) submit.disabled = false;
            }
        });

        copyButton.addEventListener('click', async () => {
            const body = frame.contentDocument.body;
            try {
                await navigator.clipboard.write([new ClipboardItem({
                    'text/html': new Blob([body.innerHTML], { type: 'text/html' }),
                    'text/plain': new Blob([body.innerText], { type: 'text/plain' }),
                })]);
            } catch (_) {
                const selection = frame.contentWindow.getSelection();
                selection.selectAllChildren(body);
                frame.contentDocument.execCommand('copy');
                selection.removeAllRanges();
            }
            setStatus('Kopiert. Jetzt in Outlook einfügen.');
        });

        dialog = { overlay };
    }

    // ---------------------------------------------------------------- Menü

    const MENU_ANCHORS = ['/mpo/rpt/mpocalendarsubscription', '/mpo/rpt/mpoopenpositions'];

    function addMenuEntry() {
        if (document.querySelector('[data-wm-menu]')) return;
        const anchor = MENU_ANCHORS.map((href) => document.querySelector(`a[href="${href}"]`)).find(Boolean);
        const item = anchor?.closest('li');
        if (!item) return;
        const entry = item.cloneNode(true);
        entry.setAttribute('data-wm-menu', '');
        const link = entry.querySelector('a');
        link.setAttribute('href', '#wochenmail');
        link.removeAttribute('routerlinkactive');
        link.classList.remove('active-route');
        link.querySelector('i')?.setAttribute('class', 'layout-menuitem-icon pi pi-envelope');
        const text = link.querySelector('.layout-menuitem-text');
        if (text) text.textContent = 'Wochenmail';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDialog();
        });
        item.after(entry);
    }

    // Das MPO ist eine Angular-App und baut das Menü bei Bedarf neu auf.
    new MutationObserver(addMenuEntry).observe(document.body, { childList: true, subtree: true });
    addMenuEntry();
})();
