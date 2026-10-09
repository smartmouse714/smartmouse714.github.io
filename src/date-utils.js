export function formatHqDate(date) {
    const dateTime = date.toISOString().split("T")[0];
    const weekday = date.toLocaleDateString("en-US", {
        weekday: "short"
    });

    return {
        text: `${weekday}, ${dateTime}`,
        dateTime
    };
}

export function formatTime(date, timeZone) {
    return date.toLocaleTimeString("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function getCalendarDay(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, Number(value)])
    );

    return Date.UTC(values.year, values.month - 1, values.day) / 86_400_000;
}

export function dayOffsetLabel(referenceZone, targetZone, date = new Date()) {
    const difference =
        getCalendarDay(date, targetZone) - getCalendarDay(date, referenceZone);

    if (difference === 1) return "Tomorrow";
    if (difference === -1) return "Yesterday";
    return "";
}
