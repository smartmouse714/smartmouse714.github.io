export const CONFIG = {
    analogTimezone: "Australia/Melbourne",
    refreshInterval: 60_000,
    statusRefreshInterval: 300_000,
    colors: {
        black: "#444",
        white: "#fff"
    }
};

export const TIMEZONES = [
    "Asia/Singapore",
    "Australia/Perth",
    "Australia/Darwin",
    "Australia/Sydney",
    "Australia/Brisbane",
    "Australia/Adelaide",
    "Pacific/Auckland",
    "Europe/London",
    "America/Denver"
];

export const DAY_OFFSETS = [
    { id: "AucklandDayOffset", timeZone: "Pacific/Auckland" },
    { id: "SingaporeDayOffset", timeZone: "Asia/Singapore" },
    { id: "LondonDayOffset", timeZone: "Europe/London" },
    { id: "DenverDayOffset", timeZone: "America/Denver" },
    { id: "PerthDayOffset", timeZone: "Australia/Perth" },
    { id: "DarwinDayOffset", timeZone: "Australia/Darwin" },
    { id: "SydneyDayOffset", timeZone: "Australia/Sydney" },
    { id: "BrisbaneDayOffset", timeZone: "Australia/Brisbane" },
    { id: "AdelaideDayOffset", timeZone: "Australia/Adelaide" }
];

export const getCity = zone => zone.split("/").at(-1);
