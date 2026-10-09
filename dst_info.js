/**
 * DST information and countdown for Australia, New Zealand, UK, and Canada.
 *
 * Rules:
 *   NZ  – starts last Sunday of September, ends first Sunday of April
 *   AU  – starts first Sunday of October,  ends first Sunday of April
 *   UK  – starts last Sunday of March,     ends last Sunday of October
 *   CA  – starts second Sunday of March,   ends first Sunday of November
 */

function firstSundayOfApril(year) {
    const d = new Date(year, 3, 1);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(3, 0, 0, -1);
    return d;
}

function lastSundayOfSeptember(year) {
    const d = new Date(year, 8, 30);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(2, 0, 0, -1);
    return d;
}

function firstSundayOfOctober(year) {
    const d = lastSundayOfSeptember(year);
    d.setDate(d.getDate() + 7);
    return d;
}

function lastSundayOfMarch(year) {
    const d = new Date(year, 2, 31);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(1, 0, 0, -1);
    return d;
}

function lastSundayOfOctober(year) {
    const d = new Date(year, 9, 31);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(1, 0, 0, -1);
    return d;
}

function secondSundayOfMarch(year) {
    const d = new Date(year, 2, 1);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7) + 7);
    d.setHours(2, 0, 0, -1);
    return d;
}

function firstSundayOfNovember(year) {
    const d = new Date(year, 10, 1);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(2, 0, 0, -1);
    return d;
}

function getNorthernDSTDetails(startFn, endFn) {
    const now = new Date();
    const year = now.getFullYear();

    const startThisYear = startFn(year);
    const endThisYear = endFn(year);

    if (now >= startThisYear && now < endThisYear) {
        return {
            isDST: true,
            lastChange: startThisYear,
            lastEvent: "start",
            nextChange: endThisYear,
            nextEvent: "end"
        };
    }

    if (now < startThisYear) {
        return {
            isDST: false,
            lastChange: endFn(year - 1),
            lastEvent: "end",
            nextChange: startThisYear,
            nextEvent: "start"
        };
    }

    return {
        isDST: false,
        lastChange: endThisYear,
        lastEvent: "end",
        nextChange: startFn(year + 1),
        nextEvent: "start"
    };
}

function getDSTDetails(startFn, endFn) {
    const now = new Date();
    const year = now.getFullYear();

    const startThisYear = startFn(year);
    const endThisYear = endFn(year);

    if (now >= startThisYear) {
        return {
            isDST: true,
            lastChange: startThisYear,
            lastEvent: "start",
            nextChange: endFn(year + 1),
            nextEvent: "end"
        };
    }

    if (now < endThisYear) {
        return {
            isDST: true,
            lastChange: startFn(year - 1),
            lastEvent: "start",
            nextChange: endThisYear,
            nextEvent: "end"
        };
    }

    return {
        isDST: false,
        lastChange: endThisYear,
        lastEvent: "end",
        nextChange: startThisYear,
        nextEvent: "start"
    };
}

const nz = getDSTDetails(lastSundayOfSeptember, firstSundayOfApril);
const au = getDSTDetails(firstSundayOfOctober, firstSundayOfApril);
const uk = getNorthernDSTDetails(lastSundayOfMarch, lastSundayOfOctober);
const ca = getNorthernDSTDetails(secondSundayOfMarch, firstSundayOfNovember);

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function nowInTimezone(tz) {
    return new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
}

function countdownInDays(targetDate, tz) {
    const diff = targetDate - nowInTimezone(tz);
    if (diff <= 0) return null;
    return (diff / (1000 * 60 * 60 * 24)).toFixed(2);
}

const COUNTDOWN_TARGETS = [
    { nextChange: ca.nextChange, tz: "America/Denver", selector: ".caCountdown" },
    { nextChange: uk.nextChange, tz: "Europe/London", selector: ".ukCountdown" },
    { nextChange: nz.nextChange, tz: "Pacific/Auckland", selector: ".nzCountdown" },
    { nextChange: au.nextChange, tz: "Australia/Sydney", selector: ".au1Countdown" },
    { nextChange: au.nextChange, tz: "Australia/Adelaide", selector: ".au2Countdown" }
];

function refreshCountdowns() {
    for (const { nextChange, tz, selector } of COUNTDOWN_TARGETS) {
        const days = countdownInDays(nextChange, tz);

        document.querySelectorAll(selector).forEach(el => {
            if (days === null) {
                el.textContent = "Time change is occurring now";
                return;
            }

            const meter = document.createElement("meter");
            meter.min = 0;
            meter.max = 183;
            meter.value = Number(days);
            meter.low = 30;
            meter.high = 90;
            meter.optimum = 183;
            meter.setAttribute("aria-label", "Days until next time change");

            const v = Number(days);
            meter.className = v < 30 ? "meter-critical"
                            : v < 90 ? "meter-warn"
                            : "meter-ok";

            el.replaceChildren("Countdown to next change ", meter, ` ${days} days`);
        });
    }
}

function setDSTLegendState(clockIds, isDST) {
    for (const id of clockIds) {
        document.getElementById(id)
            ?.closest("fieldset")
            ?.classList.toggle("dst-active", isDST);
    }
}

function setChangeText(elements, event, date) {
    const text = `DST ${event}ed after ${formatDate(date)}`;
    elements.forEach(el => {
        el.textContent = text;
    });
}

function setNextText(elements, event, date) {
    const text = `and will ${event} after ${formatDate(date)}`;
    elements.forEach(el => {
        el.textContent = text;
    });
}

function updateDSTUI() {
    setDSTLegendState(["LondonClock"], uk.isDST);
    setDSTLegendState(["DenverClock"], ca.isDST);
    setDSTLegendState(["AucklandClock"], nz.isDST);
    setDSTLegendState(["SydneyClock", "AdelaideClock"], au.isDST);

    setChangeText(
        [document.getElementById("ukLastChange")].filter(Boolean),
        uk.lastEvent,
        uk.lastChange
    );
    setNextText(
        [document.getElementById("ukNextChange")].filter(Boolean),
        uk.nextEvent,
        uk.nextChange
    );

    setChangeText(
        [document.getElementById("caLastChange")].filter(Boolean),
        ca.lastEvent,
        ca.lastChange
    );
    setNextText(
        [document.getElementById("caNextChange")].filter(Boolean),
        ca.nextEvent,
        ca.nextChange
    );

    setChangeText(
        [document.getElementById("nzLastChange")].filter(Boolean),
        nz.lastEvent,
        nz.lastChange
    );
    setNextText(
        [document.getElementById("nzNextChange")].filter(Boolean),
        nz.nextEvent,
        nz.nextChange
    );

    setChangeText(
        document.querySelectorAll(".auLastChange"),
        au.lastEvent,
        au.lastChange
    );
    setNextText(
        document.querySelectorAll(".auNextChange"),
        au.nextEvent,
        au.nextChange
    );
}

export function startDstInfo() {
    updateDSTUI();
    refreshCountdowns();
    setInterval(refreshCountdowns, 60_000);
}
