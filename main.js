import { startWorldClock } from "./world_clock.js";
import { startDSTInfo } from "./dst_info.js";
import { startHolidays } from "./holiday.js";
import { startStatus } from "./status.js";

const now = new Date();

startWorldClock(now);
startDSTInfo(now);
startHolidays(now);
startStatus();
