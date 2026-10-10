import {
    CONFIG,
    CATALOG,
    TeamViewerURL
} from "./config.js";

/**
 * Fetches the live page and returns { version, lastUpdate } for the current release.
 * Run server-side (Node 18+, Route Handler, Server Action): the site does not
 * send CORS headers, so a browser fetch will be blocked.
 * 
 * async function fetchHolidays(country, year) {
     const key = `${country}-${year}`;
     if (cache.has(key)) return cache.get(key);
 
     const res = await fetch(`${HolidayAPI_BASE}/${year}/${country}`);
     if (!res.ok) throw new Error(`Failed to fetch holidays for ${country} ${year}`);
 
 */
async function getSoftwareVersion() {
    const el = document.getElementById("latestVersion");
    if (!el) return;

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Application</th>
                    <th>Version</th>
                    <th>Published</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const { title, url } of CATALOG) {
        try {
            const response = await fetch(url);
            const release = await response.json();

            html += `
                <tr>
                    <td>${title}</td>
                    <td>${release.tag_name}</td>
                    <td>${release.published_at.slice(0, 10)}</td>
                </tr>
            `;
        } catch {
            html += `
                <tr>
                    <td>${title}</td>
                    <td colspan="2">Unknown</td>
                </tr>
            `;
        }
    }

    html += `
            </tbody>
        </table>
    `;

    el.innerHTML = html;
}

/**
 * TeamViewer
 * @returns 
 */
async function updateTeamViewerStatus() {
    const el = document.getElementById("teamviewerStatus");
    if (!el) return;

    try {
        const response = await fetch(TeamViewerURL);
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

function refreshAllStatuses() {
    // updateMicrosoftStatus();
    updateTeamViewerStatus();

    getSoftwareVersion();
    // console.log(`Version: ${ version } `);        // Version: 3.23.0
    // console.log(`Last Update: ${ lastUpdate } `); // Last Update: August 2026
}

export function startStatus() {
    refreshAllStatuses();
    setInterval(refreshAllStatuses, CONFIG.statusRefreshInterval);
}
