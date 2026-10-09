import { CONFIG } from "./config.js";

async function loadVicIncidents() {
    const container = document.getElementById("vicIncidents");

    try {
        // Use a proxy if the RSS feed blocks CORS
        const rssUrl =
            "https://api.allorigins.win/raw?url=" +
            encodeURIComponent(
                "https://data.emergency.vic.gov.au/Show?pageId=getIncidentRSS"
            );

        const response = await fetch(rssUrl);
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const items = [...xml.querySelectorAll("item")];

        const keywords = ["FRANKSTON", "MONASH"];

        const matches = items.filter(item => {
            const title = item.querySelector("title")?.textContent ?? "";
            const description = item.querySelector("description")?.textContent ?? "";

            const text = `${title} ${description}`.toLowerCase();

            return keywords.some(keyword => text.includes(keyword));
        });

        if (matches.length === 0) {
            container.innerHTML =
                "<p>No active incidents found for Frankston or Monash.</p>";
            return;
        }

        container.innerHTML = matches
            .map(item => {
                const title = item.querySelector("title")?.textContent ?? "";
                const description =
                    item.querySelector("description")?.textContent ?? "";
                const pubDate =
                    item.querySelector("pubDate")?.textContent ?? "";
                const link = item.querySelector("link")?.textContent ?? "#";

                return `
                    <div class="incident">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <small>${pubDate}</small><br>
                        ${link}
                            View Details
                        </a>
                    </div>
                `;
            })
            .join("");
    } catch (error) {
        console.error(error);
        container.innerHTML =
            "<p>Unable to load incident feed.</p>";
    }
}

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
	
	loadVicIncidents();
}

export function startStatus() {
    refreshAllStatuses();
    setInterval(refreshAllStatuses, CONFIG.statusRefreshInterval);
}
