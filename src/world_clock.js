import {
    CONFIG,
    DAY_OFFSETS,
    TIMEZONES,
    getCity
} from "./config.js";

import {
    dayOffsetLabel,
    formatHqDate,
    formatTime
} from "./date-utils.js";

const cityElements = new Map();

function cacheElements() {
    for (const zone of TIMEZONES) {
        const city = getCity(zone);
        const element = document.getElementById(`${city}Clock`);

        if (element) {
            cityElements.set(city, element);
        }
    }
}

function drawHand(ctx, angle, length, width, color) {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, width);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

function drawClockFace(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.colors.white;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = CONFIG.colors.black;
    ctx.stroke();
}

function drawClockNumbers(ctx, radius) {
    ctx.font = "bold 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = CONFIG.colors.black;

    for (const number of [3, 6, 9, 12]) {
        const angle = (number - 3) * Math.PI / 6;
        ctx.fillText(
            number,
            Math.cos(angle) * (radius - 18),
            Math.sin(angle) * (radius - 18)
        );
    }
}

function drawCenterPin(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.colors.black;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.colors.white;
    ctx.fill();
}

function drawAnalogClock() {
    const canvas = document.getElementById("hq-clock");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);

    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: CONFIG.analogTimezone })
    );

    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    drawClockFace(ctx, radius);
    drawClockNumbers(ctx, radius);
    drawHand(ctx, hours * Math.PI / 6, radius * 0.5, 8, CONFIG.colors.black);
    drawHand(ctx, minutes * Math.PI / 30, radius * 0.8, 5, CONFIG.colors.black);
    drawCenterPin(ctx);

    ctx.restore();
}

function updateDate() {
    const currentDate = document.getElementById("currentDate");
    if (!currentDate) return;

    const { text, dateTime } = formatHqDate(new Date());
    currentDate.textContent = text;
    currentDate.dateTime = dateTime;
}

function updateDayOffsetLabels(now) {
    for (const { id, timeZone } of DAY_OFFSETS) {
        const element = document.getElementById(id);
        if (!element) continue;

        element.textContent = dayOffsetLabel(
            CONFIG.analogTimezone,
            timeZone,
            now
        );
    }
}

function updateClocks() {
    const now = new Date();

    for (const zone of TIMEZONES) {
        const element = cityElements.get(getCity(zone));
        if (!element) continue;

        element.dateTime = now.toISOString();
        element.textContent = formatTime(now, zone);
    }

    updateDayOffsetLabels(now);
}

function render() {
    updateDate();
    updateClocks();
    drawAnalogClock();
}

export function startWorldClock() {
    cacheElements();
    render();
    setInterval(render, CONFIG.refreshInterval);
}
