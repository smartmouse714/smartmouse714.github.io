
function firstSundayOfApril(year) {
    const d = new Date(year, 3, 1); // Apr 1

    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(3, 0, 0, 0); // Set time to 3:00 AM

    return d;
}

function lastSundayOfSeptember(year) {
    const d = new Date(year, 8, 30); // Sep 30

    d.setDate(d.getDate() - d.getDay());
    d.setHours(2, 0, 0, 0); // Set time to 2:00 AM

    return d;
}

function firstSundayOfOctober(year) {
    const d = new Date(year, 9, 1); // Oct 1

    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(2, 0, 0, 0); // Set time to 2:00 AM

    return d;
}

function getDSTDetails(startFn, endFn) {
    const now = new Date();
    const year = now.getFullYear();

    const startThisYear = startFn(year);
    const endThisYear = endFn(year);

    let isDST;
    let lastChange;
    let nextChange;
    let lastEvent;
    let nextEvent;

    if (now >= startThisYear || now < endThisYear) {
        isDST = "Active";

        if (now < endThisYear) {
            lastChange = startFn(year - 1);
            nextChange = endThisYear;
        } else {
            lastChange = startThisYear;
            nextChange = endFn(year + 1);
        }
        lastEvent = "start";
        nextEvent = "end";
    } else {
        isDST = "Inactive";

        lastChange = endThisYear;
        lastEvent = "end";

        nextChange = startThisYear;
        nextEvent = "start";
    }

    return {
        isDST,
        lastChange,
        lastEvent,
        nextChange,
        nextEvent
    };
}

const nz = getDSTDetails(
    lastSundayOfSeptember,
    firstSundayOfApril
);

const au = getDSTDetails(
    firstSundayOfOctober,
    firstSundayOfApril
);

function formatDate(date) {
    return date.toLocaleDateString("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

document.getElementById("nzStatus").textContent = nz.isDST;
document.getElementById("nzLastChange").textContent = `${nz.lastEvent} - ${formatDate(nz.lastChange)}`;
document.getElementById("nzNextChange").textContent = `${nz.nextEvent} - ${formatDate(nz.nextChange)}`;


document.getElementById("auStatus").textContent = au.isDST;
document.getElementById("auLastChange").textContent = `${au.lastEvent} - ${formatDate(au.lastChange)}`;
document.getElementById("auNextChange").textContent = `${au.nextEvent} - ${formatDate(au.nextChange)}`;

function updateCountdown(targetDate, elementId) {
    const diff = targetDate - new Date();

    const element = document.getElementById(elementId);

    if (diff <= 0) {
        element.textContent = "Time change is occurring now";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    element.textContent = `${days}d ${hours}h ${minutes}m`;
}

function updateNZCountdown() {
    const diff = nz.nextChange - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    document.getElementById("nzCountdown").textContent = days;
}

function refreshCountdowns() {
    updateCountdown(nz.nextChange, "nzCountdown");
    updateCountdown(au.nextChange, "auCountdown");
}

refreshCountdowns();
setInterval(refreshCountdowns, 60000);