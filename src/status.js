import { CONFIG } from "./config.js";

async function updateTeamViewerStatus() {
    const el = document.getElementById("teamviewerStatus");
    if (!el) return;

    try {
        const response = await fetch(
            "https://status.teamviewer.com/api/v2/summary.json"
        );

        const data = await response.json();

        if (!data.incidents || data.incidents.length === 0) {
            el.textContent = "OK";
            el.className = "status-ok";
        } else {
            el.textContent = data.incidents
                .map(i => i.name)
                .join(", ");
            el.className = "status-incident";
        }
    } catch {
        el.textContent = "Status Unknown";
    }
}

async function updateMicrosoftStatus() {
    const el = document.getElementById("azStatus");
    if (!el) return;

    try {
        const response = await fetch(
            "https://rssfeed.azure.status.microsoft/en-us/status/feed/"
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const xmlText = await response.text();
        const doc = new DOMParser().parseFromString(xmlText, "application/xml");

        if (doc.querySelector("parsererror")) {
            throw new Error("Invalid RSS");
        }

        const items = [...doc.querySelectorAll("channel > item")];

        if (items.length === 0) {
            el.textContent = "OK";
            el.className = "status-ok";
        } else {
            const titles = items
                .map(item => item.querySelector("title")?.textContent?.trim())
                .filter(Boolean);

            el.textContent =
                titles.length > 0 ? titles.join(", ") : "Incident";
            el.className = "status-incident";
        }
    } catch {
        el.textContent = "Status Unknown";
        el.className = "status-unknown";
    }
}

function refreshAllStatuses() {
    updateMicrosoftStatus();
    updateTeamViewerStatus();
}

export function startStatus() {
    refreshAllStatuses();
    setInterval(refreshAllStatuses, CONFIG.statusRefreshInterval);
}
